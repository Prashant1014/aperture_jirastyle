import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendPushNotification, broadcastPushNotification } from "@/lib/webpush";
import { isCoreOrAbove } from "@/lib/roles";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { title, body: messageBody, url, userId, broadcast } = body;

    if (!title || !messageBody) {
      return NextResponse.json(
        { error: "Title and body are required for push notifications." },
        { status: 400 }
      );
    }

    // Security check: Check for Bearer token secret or NextAuth session
    const authHeader = req.headers.get("authorization");
    const secretKey =
      process.env.PUSH_API_SECRET ||
      process.env.CRON_SECRET ||
      process.env.AUTH_SECRET;

    const isTokenAuthorized =
      secretKey &&
      authHeader &&
      authHeader.toLowerCase().startsWith("bearer ") &&
      authHeader.slice(7).trim() === secretKey;

    const session = await auth();

    if (!isTokenAuthorized && !session?.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please authenticate to trigger push notifications." },
        { status: 401 }
      );
    }

    // Permission check for user sessions
    if (!isTokenAuthorized && session?.user) {
      const isCore = isCoreOrAbove(session.user.role);
      
      // If regular member, they can only send a test notification to themselves
      if (!isCore) {
        if (broadcast || (userId && userId !== session.user.id)) {
          return NextResponse.json(
            { error: "Forbidden. Only Core Members and Web Admins can broadcast notifications." },
            { status: 403 }
          );
        }
      }
    }

    const payload = {
      title,
      body: messageBody,
      url: url || "/",
    };

    if (broadcast) {
      const result = await broadcastPushNotification(payload);
      return NextResponse.json({
        success: true,
        type: "broadcast",
        sentCount: result.sentCount,
      });
    }

    const targetUserId = userId || session?.user?.id;
    if (!targetUserId) {
      return NextResponse.json(
        { error: "Target userId or broadcast flag is required." },
        { status: 400 }
      );
    }

    const result = await sendPushNotification(targetUserId, payload);
    return NextResponse.json({
      success: true,
      type: "user",
      userId: targetUserId,
      sentCount: result.sentCount,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in /api/push/send:", error);
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
