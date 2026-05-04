import { TableOfContentsStructure, TOCChapter, TOCSection, TOCSubsection } from '@/lib/types/reports';

export interface ParseError {
  line: number;
  message: string;
}

export interface ParseResult {
  success: boolean;
  data?: TableOfContentsStructure;
  errors?: ParseError[];
}

// Regex patterns for matching TOC lines
const PATTERNS = {
  chapter: /^Chapter no\.\s*(\d+)\.\s*(.+)$/,       // "Chapter no. 1.\tTitle"
  section: /^(\d+)\.(\d+)\.?\s+(.+)$/,              // "1.1.\tTitle" or "1.1\tTitle"
  subsection: /^(\d+)\.(\d+)\.(\d+)\.?\s+(.+)$/,   // "1.1.1.\tTitle" or "1.1.1\tTitle"
  fourthLevel: /^(\d+)\.(\d+)\.(\d+)\.(\d+)\.?\s+(.+)$/, // "1.1.1.1.\tTitle" (treated as subsection)
};

// Default TOC template constant
export const DEFAULT_TOC_TEMPLATE = `Chapter no. 1.	Introduction
1.1.	Report Description
1.1.1.	Purpose of the Report
1.1.2.	USP & Key Offerings
1.2.	Key Benefits for Stakeholders
1.3.	Target Audience
1.4.	Report Scope
Chapter no. 2.	Executive Summary
2.1.	Key Findings
2.1.1.	Top Investment Pockets
2.1.1.1.	XXX Market Attractiveness Analysis, By Segment 1
2.1.1.2.	XXX Market Attractiveness Analysis, By Segment 2
2.2.	XXX Market Snapshot
Chapter no. 3.	Research Methodology
3.1.	Research Methodology
3.2.	Secondary Research
3.3.	Primary Research
3.3.1.	Analyst Tools and Models
3.4.	Research Limitations
3.5.	Assumptions
3.6.	Global XXX Market, 2026 - 2035 (USD Billion)
3.7.	Insights from Primary Respondents
Chapter no. 4.	Factors Impacting the Market Analysis
4.1.	Short Term Dynamics
4.2.	Long Term Dynamics
4.3.	Industry Pain Point Analysis
4.4.	Value Chain Analysis
Chapter no. 5.	XXX Market – By Segment 1
5.1.	XXX Market Overview, by Segment 1 Segment
5.1.1.	XXX Market Revenue Share, By Segment 1, 2026 & 2035
5.1.2.	Sub-Segment 1
5.1.3.	Healthcare Services Share Forecast, By Region (USD Billion)
5.1.4.	Comparative Revenue Analysis, By Country, 2026 & 2035
5.1.5.	Key Market Trends, Growth Factors, & Opportunities
5.1.6.	Sub-Segment 2
5.1.7.	Healthcare Services Share Forecast, By Region (USD Billion)
5.1.8.	Comparative Revenue Analysis, By Country, 2026 & 2035
5.1.9.	Key Market Trends, Growth Factors, & Opportunities
Chapter no. 6.	XXX Market – By Segment 2
6.1.	XXX Market Overview, by Segment 2 Segment
6.1.1.	XXX Market Revenue Share, By Segment 2, 2026 & 2035
6.1.2.	Sub-Segment 1
6.1.3.	Healthcare Services Share Forecast, By Region (USD Billion)
6.1.4.	Comparative Revenue Analysis, By Country, 2026 & 2035
6.1.5.	Key Market Trends, Growth Factors, & Opportunities
6.1.6.	Sub-Segment 2
6.1.7.	Healthcare Services Share Forecast, By Region (USD Billion)
6.1.8.	Comparative Revenue Analysis, By Country, 2026 & 2035
6.1.9.	Key Market Trends, Growth Factors, & Opportunities
6.1.10.	Sub-Segment 3
6.1.11.	Healthcare Services Share Forecast, By Region (USD Billion)
6.1.12.	Comparative Revenue Analysis, By Country, 2026 & 2035
6.1.13.	Key Market Trends, Growth Factors, & Opportunities
6.1.14.	Sub-Segment 4
6.1.15.	Healthcare Services Share Forecast, By Region (USD Billion)
6.1.16.	Comparative Revenue Analysis, By Country, 2026 & 2035
6.1.17.	Key Market Trends, Growth Factors, & Opportunities
6.1.18.	Sub-Segment 5
6.1.19.	Healthcare Services Share Forecast, By Region (USD Billion)
6.1.20.	Comparative Revenue Analysis, By Country, 2026 & 2035
6.1.21.	Key Market Trends, Growth Factors, & Opportunities
6.1.22.	Sub-Segment 6
6.1.23.	Healthcare Services Share Forecast, By Region (USD Billion)
6.1.24.	Comparative Revenue Analysis, By Country, 2026 & 2035
6.1.25.	Key Market Trends, Growth Factors, & Opportunities
Chapter no. 7.	XXX Market – Regional Analysis
7.1.	XXX Market Overview, by Region Segment
7.1.1.	Global XXX Market Revenue Share, By Region, 2026 & 2035
7.1.2.	Global XXX Market Revenue, By Region, 2026 - 2035 (USD Billion)
7.1.3.	Global XXX Market Revenue, By Segment 1, 2026 - 2035
7.1.4.	Global XXX Market Revenue, By Segment 2, 2026 - 2035
7.2.	North America
7.2.1.	North America XXX Market Revenue, By Country, 2026 - 2035 (USD Billion)
7.2.2.	North America XXX Market Revenue, By Segment 1, 2026 - 2035
7.2.3.	North America XXX Market Revenue, By Segment 2, 2026 - 2035
7.2.4.	U.S. XXX Market Revenue, 2022 - 2034 (USD Billion)
7.2.5.	Canada XXX Market Revenue, 2022 - 2034 (USD Billion)
7.2.6.	Mexico XXX Market Revenue, 2022 - 2034 (USD Billion)
7.2.7.	Rest of North America XXX Market Revenue, 2022 - 2034 (USD Billion)
7.3.	Europe
7.3.1.	Europe XXX Market Revenue, By Country, 2026 - 2035 (USD Billion)
7.3.2.	Europe XXX Market Revenue, By Segment 1, 2026 - 2035
7.3.3.	Europe XXX Market Revenue, By Segment 2, 2026 - 2035
7.3.4.	Germany XXX Market Revenue, 2022 - 2034 (USD Billion)
7.3.5.	France XXX Market Revenue, 2022 - 2034 (USD Billion)
7.3.6.	U.K. XXX Market Revenue, 2022 - 2034 (USD Billion)
7.3.7.	Russia XXX Market Revenue, 2022 - 2034 (USD Billion)
7.3.8.	Italy XXX Market Revenue, 2022 - 2034 (USD Billion)
7.3.9.	Spain XXX Market Revenue, 2022 - 2034 (USD Billion)
7.3.10.	Netherlands XXX Market Revenue, 2022 - 2034 (USD Billion)
7.3.11.	Rest of Europe XXX Market Revenue, 2022 - 2034 (USD Billion)
7.4.	Asia Pacific
7.4.1.	Asia Pacific XXX Market Revenue, By Country, 2026 - 2035 (USD Billion)
7.4.2.	Asia Pacific XXX Market Revenue, By Segment 1, 2026 - 2035
7.4.3.	Asia Pacific XXX Market Revenue, By Segment 2, 2026 - 2035
7.4.4.	China XXX Market Revenue, 2022 - 2034 (USD Billion)
7.4.5.	Japan XXX Market Revenue, 2022 - 2034 (USD Billion)
7.4.6.	India XXX Market Revenue, 2022 - 2034 (USD Billion)
7.4.7.	New Zealand XXX Market Revenue, 2022 - 2034 (USD Billion)
7.4.8.	Australia XXX Market Revenue, 2022 - 2034 (USD Billion)
7.4.9.	South Korea XXX Market Revenue, 2022 - 2034 (USD Billion)
7.4.10.	Taiwan XXX Market Revenue, 2022 - 2034 (USD Billion)
7.4.11.	Rest of Asia Pacific XXX Market Revenue, 2022 - 2034 (USD Billion)
7.5.	The Middle-East and Africa
7.5.1.	The Middle-East and Africa XXX Market Revenue, By Country, 2026 - 2035 (USD Billion)
7.5.2.	The Middle-East and Africa XXX Market Revenue, By Segment 1, 2026 - 2035
7.5.3.	The Middle-East and Africa XXX Market Revenue, By Segment 2, 2026 - 2035
7.5.4.	Saudi Arabia XXX Market Revenue, 2022 - 2034 (USD Billion)
7.5.5.	UAE XXX Market Revenue, 2022 - 2034 (USD Billion)
7.5.6.	Egypt XXX Market Revenue, 2022 - 2034 (USD Billion)
7.5.7.	Kuwait XXX Market Revenue, 2022 - 2034 (USD Billion)
7.5.8.	South Africa XXX Market Revenue, 2022 - 2034 (USD Billion)
7.5.9.	Rest of the Middle East & Africa XXX Market Revenue, 2022 - 2034 (USD Billion)
7.6.	Latin America
7.6.1.	Latin America XXX Market Revenue, By Country, 2026 - 2035 (USD Billion)
7.6.2.	Latin America XXX Market Revenue, By Segment 1, 2026 - 2035
7.6.3.	Latin America XXX Market Revenue, By Segment 2, 2026 - 2035
7.6.4.	Brazil XXX Market Revenue, 2022 - 2034 (USD Billion)
7.6.5.	Argentina XXX Market Revenue, 2022 - 2034 (USD Billion)
7.6.6.	Rest of Latin America XXX Market Revenue, 2022 - 2034 (USD Billion)
Chapter no. 8.	XXX Market – Industry Analysis
8.1.	Introduction
8.2.	Market Drivers
8.2.1.	Driving Factor 1 Analysis
8.2.2.	Driving Factor 2 Analysis
8.3.	Market Restraints
8.3.1.	Restraining Factor Analysis
8.4.	Market Opportunities
8.4.1.	Market Opportunity Analysis
8.4.2.	Porter's Five Forces Analysis
8.5.	PESTEL Analysis
8.6.	Regulatory Landscape
8.7.	Technology Landscape
8.8.	Regional Market Trends
8.8.1.	North America
8.8.2.	Europe
8.8.3.	Asia Pacific
8.8.4.	Latin America
8.8.5.	The Middle East and Africa
8.9.	Downstream Buyers
8.10.	Distributors/Traders List
Chapter no. 9.	Competitive Landscape
9.1.	Company Market Share Analysis – 2024
9.1.1.	Global XXX Market: Company Market Share, 2024
9.2.	Global XXX Market Company Market Share, 2024
9.3.	Strategic Developments
9.3.1.	Acquisitions & Mergers
9.3.2.	New Product Launch
9.3.3.	Regional Expansion
9.4.	Company Strategic Developments – Heat Map Analysis
Chapter no. 10.	Company Profiles
10.1.	Company 1
10.1.1.	Company Overview
10.1.2.	Key Executives
10.1.3.	Product Portfolio
10.1.4.	Financial Overview
10.1.5.	Operating Business Segments
10.1.6.	Business Performance
10.1.7.	Recent Developments
10.2.	Company 2
10.2.1.	Company Overview
10.2.2.	Key Executives
10.2.3.	Product Portfolio
10.2.4.	Financial Overview
10.2.5.	Operating Business Segments
10.2.6.	Business Performance
10.2.7.	Recent Developments
10.3.	Company 3
10.3.1.	Company Overview
10.3.2.	Key Executives
10.3.3.	Product Portfolio
10.3.4.	Financial Overview
10.3.5.	Operating Business Segments
10.3.6.	Business Performance
10.3.7.	Recent Developments
10.4.	Company 4
10.4.1.	Company Overview
10.4.2.	Key Executives
10.4.3.	Product Portfolio
10.4.4.	Financial Overview
10.4.5.	Operating Business Segments
10.4.6.	Business Performance
10.4.7.	Recent Developments
10.5.	Company 5.
10.5.1.	Company Overview
10.5.2.	Key Executives
10.5.3.	Product Portfolio
10.5.4.	Financial Overview
10.5.5.	Operating Business Segments
10.5.6.	Business Performance
10.5.7.	Recent Developments
10.6.	Company 6
10.6.1.	Company Overview
10.6.2.	Key Executives
10.6.3.	Product Portfolio
10.6.4.	Financial Overview
10.6.5.	Operating Business Segments
10.6.6.	Business Performance
10.6.7.	Recent Developments
10.7.	Company 7.
10.7.1.	Company Overview
10.7.2.	Key Executives
10.7.3.	Product Portfolio
10.7.4.	Financial Overview
10.7.5.	Operating Business Segments
10.7.6.	Business Performance
10.7.7.	Recent Developments
10.8.	Company 8
10.8.1.	Company Overview
10.8.2.	Key Executives
10.8.3.	Product Portfolio
10.8.4.	Financial Overview
10.8.5.	Operating Business Segments
10.8.6.	Business Performance
10.8.7.	Recent Developments
10.9.	Company 9
10.9.1.	Company Overview
10.9.2.	Key Executives
10.9.3.	Product Portfolio
10.9.4.	Financial Overview
10.9.5.	Operating Business Segments
10.9.6.	Business Performance
10.9.7.	Recent Developments
10.10.	Company 10
10.10.1.	Company Overview
10.10.2.	Key Executives
10.10.3.	Product Portfolio
10.10.4.	Financial Overview
10.10.5.	Operating Business Segments
10.10.6.	Business Performance
10.10.7.	Recent Developments`;

/**
 * Replaces XXX placeholders in template text with the market name
 */
export function replaceTemplatePlaceholders(
  templateText: string,
  marketName: string
): string {
  return templateText.replace(/XXX/g, marketName);
}

/**
 * Gets the default TOC template
 */
export function getDefaultTemplate(): string {
  return DEFAULT_TOC_TEMPLATE;
}

/**
 * Parses template text into structured TOC data
 */
export function parseTemplateToTOC(templateText: string): ParseResult {
  const lines = templateText.split('\n');
  const chapters: TOCChapter[] = [];
  const errors: ParseError[] = [];

  let currentChapter: TOCChapter | null = null;
  let currentSection: TOCSection | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    // Handle 4-level items by treating them as subsections
    // (TOC structure only supports 3 levels: chapters, sections, subsections)
    const fourthLevelMatch = line.match(PATTERNS.fourthLevel);
    if (fourthLevelMatch) {
      if (!currentSection) {
        errors.push({
          line: i + 1,
          message: `4-level item found without parent section: "${line}"`,
        });
        continue;
      }

      // Treat 4-level items as subsections (ignore the 4th level number)
      const subsection: TOCSubsection = {
        id: crypto.randomUUID(),
        title: fourthLevelMatch[5].trim(),
      };
      currentSection.subsections.push(subsection);
      continue;
    }

    // Try matching subsection (most specific pattern first)
    const subsectionMatch = line.match(PATTERNS.subsection);
    if (subsectionMatch) {
      if (!currentSection) {
        errors.push({
          line: i + 1,
          message: `Subsection found without parent section: "${line}"`,
        });
        continue;
      }

      const subsection: TOCSubsection = {
        id: crypto.randomUUID(),
        title: subsectionMatch[4].trim(),
      };
      currentSection.subsections.push(subsection);
      continue;
    }

    // Try matching section
    const sectionMatch = line.match(PATTERNS.section);
    if (sectionMatch) {
      if (!currentChapter) {
        errors.push({
          line: i + 1,
          message: `Section found without parent chapter: "${line}"`,
        });
        continue;
      }

      currentSection = {
        id: crypto.randomUUID(),
        title: sectionMatch[3].trim(),
        subsections: [],
      };
      currentChapter.sections.push(currentSection);
      continue;
    }

    // Try matching chapter
    const chapterMatch = line.match(PATTERNS.chapter);
    if (chapterMatch) {
      currentChapter = {
        id: crypto.randomUUID(),
        title: chapterMatch[2].trim(),
        sections: [],
      };
      chapters.push(currentChapter);
      currentSection = null; // Reset current section when starting a new chapter
      continue;
    }

    // If no pattern matched and line is not empty, it's an error
    errors.push({
      line: i + 1,
      message: `Could not parse line: "${line}"`,
    });
  }

  // Return result
  if (errors.length > 0) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: { chapters },
  };
}

/**
 * Converts structured TOC data back to template text format
 * Useful for exporting or debugging
 */
export function convertTOCToTemplateText(toc: TableOfContentsStructure): string {
  const lines: string[] = [];

  toc.chapters.forEach((chapter, chapterIndex) => {
    const chapterNum = chapterIndex + 1;
    lines.push(`Chapter no. ${chapterNum}.\t${chapter.title}`);

    chapter.sections.forEach((section, sectionIndex) => {
      const sectionNum = sectionIndex + 1;
      lines.push(`${chapterNum}.${sectionNum}.\t${section.title}`);

      section.subsections.forEach((subsection, subsectionIndex) => {
        const subsectionNum = subsectionIndex + 1;
        lines.push(`${chapterNum}.${sectionNum}.${subsectionNum}.\t${subsection.title}`);
      });
    });
  });

  return lines.join('\n');
}
