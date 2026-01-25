// Vietnamese translations for common software descriptions
export const softwareTranslations: Record<string, string> = {
    // Collaboration Tools
    "Team collaboration hub that brings conversations, tools, and files together":
        "Nền tảng cộng tác nhóm kết nối cuộc trò chuyện, công cụ và tệp tin",

    "Anti-malware software for detecting and removing malicious software":
        "Phần mềm chống phần mềm độc hại, phát hiện và loại bỏ virus",

    "Free and open-source office suite with word processor, spreadsheet":
        "Bộ công cụ văn phòng miễn phí mã nguồn mở với xử lý văn bản, bảng tính",

    "Comprehensive office suite for document editing, collaboration, and":
        "Bộ công cụ văn phòng toàn diện cho chỉnh sửa tài liệu, cộng tác",

    "Lightweight office suite with word processing, spreadsheets, and":
        "Bộ công cụ văn phòng nhẹ với xử lý văn bản, bảng tính",

    "Cloud-based office suite with real-time collaboration for":
        "Bộ công cụ văn phòng đám mây với cộng tác thời gian thực",

    "All-in-one workspace for notes, tasks, wikis, and databases":
        "Không gian làm việc tất cả trong một cho ghi chú, nhiệm vụ, wiki và cơ sở dữ liệu",

    "Note-taking app with sync across devices and web clipper":
        "Ứng dụng ghi chú với đồng bộ đa thiết bị và lưu web",

    "Free and open-source media player that plays most multimedia files":
        "Trình phát đa phương tiện miễn phí mã nguồn mở, hỗ trợ hầu hết các định dạng",

    "Minimalist media player with high-quality video playback":
        "Trình phát media tối giản với chất lượng video cao",
};

// Function to translate description or return original if not found
export function translateDescription(description: string): string {
    if (!description) return "";

    // Try exact match first
    if (softwareTranslations[description]) {
        return softwareTranslations[description];
    }

    // Try partial match (first 50 characters)
    const shortDesc = description.substring(0, 50);
    for (const [key, value] of Object.entries(softwareTranslations)) {
        if (key.startsWith(shortDesc)) {
            return value;
        }
    }

    // Return original if no translation found
    return description;
}

// Function to get short Vietnamese description (max 100 chars)
export function getShortDescription(description: string, maxLength: number = 100): string {
    const translated = translateDescription(description);
    if (translated.length <= maxLength) {
        return translated;
    }
    return translated.substring(0, maxLength) + "...";
}
