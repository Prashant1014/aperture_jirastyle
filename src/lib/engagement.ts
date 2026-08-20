export type EngagementDetails = {
  coverages: string;
  design: string;
  motionSpec: string;
  socialMedia: string;
  contentWork: string;
  contentManagement: string;
  ourEvents: string;
  outhouseParticipation: string;
};

export async function getEngagementDetails(name: string): Promise<EngagementDetails | null> {
  if (!name) return null;
  try {
    const res = await fetch("https://docs.google.com/spreadsheets/d/1LwdOEPwMLQdROnQUEsCNHqRcWM9g4FcrSPbvZzM5hGs/export?format=csv&gid=1353132796", {
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    if (!res.ok) return null;
    const text = await res.text();
    
    const rows = parseCSV(text);
    
    // Find the row where the first column (NAME) matches `name` (case insensitive)
    const targetRow = rows.find(row => row[0]?.trim().toLowerCase() === name.trim().toLowerCase());
    
    if (!targetRow) return null;
    
    return {
      coverages: targetRow[2]?.trim() || "",
      design: targetRow[3]?.trim() || "",
      motionSpec: targetRow[4]?.trim() || "",
      socialMedia: targetRow[5]?.trim() || "",
      contentWork: targetRow[6]?.trim() || "",
      contentManagement: targetRow[7]?.trim() || "",
      ourEvents: targetRow[8]?.trim() || "",
      outhouseParticipation: targetRow[9]?.trim() || "",
    };
  } catch (e) {
    console.error("Failed to fetch engagement details", e);
    return null;
  }
}

function parseCSV(text: string): string[][] {
  const result: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let insideQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    
    if (char === '"' && text[i+1] === '"') {
      cell += '"';
      i++;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      row.push(cell);
      cell = "";
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && text[i+1] === '\n') {
        i++; // skip \n
      }
      row.push(cell);
      result.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length > 0) {
    row.push(cell);
    result.push(row);
  }
  return result;
}
