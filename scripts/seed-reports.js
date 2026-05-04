/**
 * Script to seed 50 sample reports into the database
 *
 * Usage:
 *   node scripts/seed-reports.js
 *
 * Environment Variables Required:
 *   - NEXT_PUBLIC_API_BASE_URL: API base URL (default: http://127.0.0.1:8080/api)
 *   - AUTH_TOKEN: Authentication token for API requests (required)
 *
 * You can pass the auth token as:
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080/api';
const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsInRva2VuX3R5cGUiOiJhY2Nlc3MiLCJpc3MiOiJoZWFsdGhjYXJlLW1hcmtldC1yZXNlYXJjaC1hcGkiLCJzdWIiOiIxIiwiZXhwIjoxNzY4ODQ5MjE1LCJuYmYiOjE3Njg4NDU2NzUsImlhdCI6MTc2ODg0NTY3NSwianRpIjoiN2U0MzIyZTktYTY0NC00NTY5LTlkNjktODRhMjg0MDM1ODQ2In0.YFdmh3O9JJtIdL6w_DE_VRQ4xWZZlYIT-Q-1nXaswGw';

// Sample data pools
const marketSegments = [
  'Pharmaceuticals',
  'Medical Devices',
  'Healthcare IT',
  'Biotechnology',
  'Diagnostics',
  'Telemedicine',
  'Surgical Equipment',
  'Clinical Research',
  'Healthcare Services',
  'Digital Health',
  'Wound Care',
  'Orthopedic Devices',
  'Cardiovascular Devices',
  'Neurology Devices',
  'Ophthalmology Devices',
  'Dental Equipment',
  'Laboratory Equipment',
  'Patient Monitoring Systems',
  'Medical Imaging Equipment',
  'Respiratory Devices',
  'Dialysis Equipment',
  'Infusion Pumps',
  'Endoscopy Equipment',
  'Anesthesia Equipment',
  'Sterilization Equipment',
  'Pharmaceutical Packaging',
  'Drug Delivery Systems',
  'Vaccines',
  'Biologics',
  'Regenerative Medicine',
  'Cell & Gene Therapy',
  'Immunotherapy',
  'Oncology Therapeutics',
  'Pain Management',
  'Mental Health Services',
  'Home Healthcare',
  'Long-term Care',
  'Rehabilitation Services',
  'Emergency Medical Services',
  'Healthcare Analytics',
  'Electronic Health Records',
  'Medical Billing Software',
  'Clinical Decision Support',
  'Population Health Management',
  'Genomics & Proteomics',
  'Molecular Diagnostics',
  'Point-of-Care Testing',
  'Laboratory Information Systems',
  'Medical Robotics',
  '3D Printing in Healthcare'
];

const geographies = [
  ['North America', 'Europe'],
  ['Asia Pacific', 'North America'],
  ['Europe', 'Asia Pacific'],
  ['Global'],
  ['Latin America', 'North America'],
  ['Middle East', 'Africa'],
  ['North America', 'Europe', 'Asia Pacific'],
  ['Europe'],
  ['Asia Pacific'],
  ['North America']
];

const trends = [
  'artificial intelligence and machine learning integration',
  'personalized medicine and genomics',
  'telemedicine and remote patient monitoring',
  'value-based care models',
  'robotic surgery and automation',
  'blockchain for healthcare data management',
  'wearable health technology',
  'digital therapeutics',
  'precision medicine',
  'cloud-based healthcare solutions'
];

const reportFormats = [
  ['PDF'],
  ['PDF', 'Excel'],
  ['PDF', 'Word'],
  ['PDF', 'Excel', 'PowerPoint'],
  ['PDF', 'Word', 'Excel']
];

// Helper function to generate random number in range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper function to pick random items from array
function randomPick(array) {
  return array[randomInt(0, array.length - 1)];
}

// Helper function to generate slug from title
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Generate table of contents based on professional template
function generateTableOfContents(segment) {
  const currentYear = new Date().getFullYear();
  const forecastYear = currentYear + 9;

  return {
    chapters: [
      {
        id: 'ch1',
        title: 'Introduction',
        pageNumber: '1',
        sections: [
          {
            id: 'sec1-1',
            title: 'Report Description',
            pageNumber: '2',
            subsections: [
              { id: 'subsec1-1-1', title: 'Purpose of the Report', pageNumber: '2' },
              { id: 'subsec1-1-2', title: 'USP & Key Offerings', pageNumber: '3' }
            ]
          },
          {
            id: 'sec1-2',
            title: 'Key Benefits for Stakeholders',
            pageNumber: '4',
            subsections: []
          },
          {
            id: 'sec1-3',
            title: 'Target Audience',
            pageNumber: '5',
            subsections: []
          },
          {
            id: 'sec1-4',
            title: 'Report Scope',
            pageNumber: '6',
            subsections: []
          }
        ]
      },
      {
        id: 'ch2',
        title: 'Executive Summary',
        pageNumber: '8',
        sections: [
          {
            id: 'sec2-1',
            title: 'Key Findings',
            pageNumber: '9',
            subsections: [
              {
                id: 'subsec2-1-1',
                title: 'Top Investment Pockets',
                pageNumber: '10',
                subsubsections: [
                  { id: 'subsubsec2-1-1-1', title: `${segment} Market Attractiveness Analysis, By Product Type`, pageNumber: '10' },
                  { id: 'subsubsec2-1-1-2', title: `${segment} Market Attractiveness Analysis, By Application`, pageNumber: '11' }
                ]
              }
            ]
          },
          {
            id: 'sec2-2',
            title: `${segment} Market Snapshot`,
            pageNumber: '12',
            subsections: []
          }
        ]
      },
      {
        id: 'ch3',
        title: 'Research Methodology',
        pageNumber: '14',
        sections: [
          {
            id: 'sec3-1',
            title: 'Research Methodology',
            pageNumber: '15',
            subsections: []
          },
          {
            id: 'sec3-2',
            title: 'Secondary Research',
            pageNumber: '16',
            subsections: []
          },
          {
            id: 'sec3-3',
            title: 'Primary Research',
            pageNumber: '17',
            subsections: [
              { id: 'subsec3-3-1', title: 'Analyst Tools and Models', pageNumber: '18' }
            ]
          },
          {
            id: 'sec3-4',
            title: 'Research Limitations',
            pageNumber: '19',
            subsections: []
          },
          {
            id: 'sec3-5',
            title: 'Assumptions',
            pageNumber: '20',
            subsections: []
          },
          {
            id: 'sec3-6',
            title: `Global ${segment} Market, ${currentYear} - ${forecastYear} (USD Billion)`,
            pageNumber: '21',
            subsections: []
          },
          {
            id: 'sec3-7',
            title: 'Insights from Primary Respondents',
            pageNumber: '22',
            subsections: []
          }
        ]
      },
      {
        id: 'ch4',
        title: 'Factors Impacting the Market Analysis',
        pageNumber: '24',
        sections: [
          {
            id: 'sec4-1',
            title: 'Short Term Dynamics',
            pageNumber: '25',
            subsections: []
          },
          {
            id: 'sec4-2',
            title: 'Long Term Dynamics',
            pageNumber: '26',
            subsections: []
          },
          {
            id: 'sec4-3',
            title: 'Industry Pain Point Analysis',
            pageNumber: '27',
            subsections: []
          },
          {
            id: 'sec4-4',
            title: 'Value Chain Analysis',
            pageNumber: '28',
            subsections: []
          }
        ]
      },
      {
        id: 'ch5',
        title: `${segment} Market – By Product Type`,
        pageNumber: '30',
        sections: [
          {
            id: 'sec5-1',
            title: `${segment} Market Overview, by Product Type Segment`,
            pageNumber: '31',
            subsections: [
              { id: 'subsec5-1-1', title: `${segment} Market Revenue Share, By Product Type, ${currentYear} & ${forecastYear}`, pageNumber: '32' },
              { id: 'subsec5-1-2', title: 'Type A', pageNumber: '33' },
              { id: 'subsec5-1-3', title: 'Market Share Forecast, By Region (USD Billion)', pageNumber: '34' },
              { id: 'subsec5-1-4', title: `Comparative Revenue Analysis, By Country, ${currentYear} & ${forecastYear}`, pageNumber: '35' },
              { id: 'subsec5-1-5', title: 'Key Market Trends, Growth Factors, & Opportunities', pageNumber: '36' },
              { id: 'subsec5-1-6', title: 'Type B', pageNumber: '37' },
              { id: 'subsec5-1-7', title: 'Market Share Forecast, By Region (USD Billion)', pageNumber: '38' },
              { id: 'subsec5-1-8', title: `Comparative Revenue Analysis, By Country, ${currentYear} & ${forecastYear}`, pageNumber: '39' },
              { id: 'subsec5-1-9', title: 'Key Market Trends, Growth Factors, & Opportunities', pageNumber: '40' }
            ]
          }
        ]
      },
      {
        id: 'ch6',
        title: `${segment} Market – By Application`,
        pageNumber: '42',
        sections: [
          {
            id: 'sec6-1',
            title: `${segment} Market Overview, by Application Segment`,
            pageNumber: '43',
            subsections: [
              { id: 'subsec6-1-1', title: `${segment} Market Revenue Share, By Application, ${currentYear} & ${forecastYear}`, pageNumber: '44' },
              { id: 'subsec6-1-2', title: 'Application A', pageNumber: '45' },
              { id: 'subsec6-1-3', title: 'Market Share Forecast, By Region (USD Billion)', pageNumber: '46' },
              { id: 'subsec6-1-4', title: `Comparative Revenue Analysis, By Country, ${currentYear} & ${forecastYear}`, pageNumber: '47' },
              { id: 'subsec6-1-5', title: 'Key Market Trends, Growth Factors, & Opportunities', pageNumber: '48' },
              { id: 'subsec6-1-6', title: 'Application B', pageNumber: '49' },
              { id: 'subsec6-1-7', title: 'Market Share Forecast, By Region (USD Billion)', pageNumber: '50' },
              { id: 'subsec6-1-8', title: `Comparative Revenue Analysis, By Country, ${currentYear} & ${forecastYear}`, pageNumber: '51' },
              { id: 'subsec6-1-9', title: 'Key Market Trends, Growth Factors, & Opportunities', pageNumber: '52' }
            ]
          }
        ]
      },
      {
        id: 'ch7',
        title: `${segment} Market – Regional Analysis`,
        pageNumber: '54',
        sections: [
          {
            id: 'sec7-1',
            title: `${segment} Market Overview, by Region Segment`,
            pageNumber: '55',
            subsections: [
              { id: 'subsec7-1-1', title: `Global ${segment} Market Revenue Share, By Region, ${currentYear} & ${forecastYear}`, pageNumber: '56' },
              { id: 'subsec7-1-2', title: `Global ${segment} Market Revenue, By Region, ${currentYear} - ${forecastYear} (USD Billion)`, pageNumber: '57' },
              { id: 'subsec7-1-3', title: `Global ${segment} Market Revenue, By Product Type, ${currentYear} - ${forecastYear}`, pageNumber: '58' },
              { id: 'subsec7-1-4', title: `Global ${segment} Market Revenue, By Application, ${currentYear} - ${forecastYear}`, pageNumber: '59' }
            ]
          },
          {
            id: 'sec7-2',
            title: 'North America',
            pageNumber: '60',
            subsections: [
              { id: 'subsec7-2-1', title: `North America ${segment} Market Revenue, By Country, ${currentYear} - ${forecastYear} (USD Billion)`, pageNumber: '61' },
              { id: 'subsec7-2-2', title: `North America ${segment} Market Revenue, By Product Type, ${currentYear} - ${forecastYear}`, pageNumber: '62' },
              { id: 'subsec7-2-3', title: `North America ${segment} Market Revenue, By Application, ${currentYear} - ${forecastYear}`, pageNumber: '63' },
              { id: 'subsec7-2-4', title: `U.S. ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '64' },
              { id: 'subsec7-2-5', title: `Canada ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '65' },
              { id: 'subsec7-2-6', title: `Mexico ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '66' },
              { id: 'subsec7-2-7', title: `Rest of North America ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '67' }
            ]
          },
          {
            id: 'sec7-3',
            title: 'Europe',
            pageNumber: '68',
            subsections: [
              { id: 'subsec7-3-1', title: `Europe ${segment} Market Revenue, By Country, ${currentYear} - ${forecastYear} (USD Billion)`, pageNumber: '69' },
              { id: 'subsec7-3-2', title: `Europe ${segment} Market Revenue, By Product Type, ${currentYear} - ${forecastYear}`, pageNumber: '70' },
              { id: 'subsec7-3-3', title: `Europe ${segment} Market Revenue, By Application, ${currentYear} - ${forecastYear}`, pageNumber: '71' },
              { id: 'subsec7-3-4', title: `Germany ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '72' },
              { id: 'subsec7-3-5', title: `France ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '73' },
              { id: 'subsec7-3-6', title: `U.K. ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '74' },
              { id: 'subsec7-3-7', title: `Russia ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '75' },
              { id: 'subsec7-3-8', title: `Italy ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '76' },
              { id: 'subsec7-3-9', title: `Spain ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '77' },
              { id: 'subsec7-3-10', title: `Netherlands ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '78' },
              { id: 'subsec7-3-11', title: `Rest of Europe ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '79' }
            ]
          },
          {
            id: 'sec7-4',
            title: 'Asia Pacific',
            pageNumber: '80',
            subsections: [
              { id: 'subsec7-4-1', title: `Asia Pacific ${segment} Market Revenue, By Country, ${currentYear} - ${forecastYear} (USD Billion)`, pageNumber: '81' },
              { id: 'subsec7-4-2', title: `Asia Pacific ${segment} Market Revenue, By Product Type, ${currentYear} - ${forecastYear}`, pageNumber: '82' },
              { id: 'subsec7-4-3', title: `Asia Pacific ${segment} Market Revenue, By Application, ${currentYear} - ${forecastYear}`, pageNumber: '83' },
              { id: 'subsec7-4-4', title: `China ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '84' },
              { id: 'subsec7-4-5', title: `Japan ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '85' },
              { id: 'subsec7-4-6', title: `India ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '86' },
              { id: 'subsec7-4-7', title: `New Zealand ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '87' },
              { id: 'subsec7-4-8', title: `Australia ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '88' },
              { id: 'subsec7-4-9', title: `South Korea ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '89' },
              { id: 'subsec7-4-10', title: `Taiwan ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '90' },
              { id: 'subsec7-4-11', title: `Rest of Asia Pacific ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '91' }
            ]
          },
          {
            id: 'sec7-5',
            title: 'The Middle-East and Africa',
            pageNumber: '92',
            subsections: [
              { id: 'subsec7-5-1', title: `The Middle-East and Africa ${segment} Market Revenue, By Country, ${currentYear} - ${forecastYear} (USD Billion)`, pageNumber: '93' },
              { id: 'subsec7-5-2', title: `The Middle-East and Africa ${segment} Market Revenue, By Product Type, ${currentYear} - ${forecastYear}`, pageNumber: '94' },
              { id: 'subsec7-5-3', title: `The Middle-East and Africa ${segment} Market Revenue, By Application, ${currentYear} - ${forecastYear}`, pageNumber: '95' },
              { id: 'subsec7-5-4', title: `Saudi Arabia ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '96' },
              { id: 'subsec7-5-5', title: `UAE ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '97' },
              { id: 'subsec7-5-6', title: `Egypt ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '98' },
              { id: 'subsec7-5-7', title: `Kuwait ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '99' },
              { id: 'subsec7-5-8', title: `South Africa ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '100' },
              { id: 'subsec7-5-9', title: `Rest of the Middle East & Africa ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '101' }
            ]
          },
          {
            id: 'sec7-6',
            title: 'Latin America',
            pageNumber: '102',
            subsections: [
              { id: 'subsec7-6-1', title: `Latin America ${segment} Market Revenue, By Country, ${currentYear} - ${forecastYear} (USD Billion)`, pageNumber: '103' },
              { id: 'subsec7-6-2', title: `Latin America ${segment} Market Revenue, By Product Type, ${currentYear} - ${forecastYear}`, pageNumber: '104' },
              { id: 'subsec7-6-3', title: `Latin America ${segment} Market Revenue, By Application, ${currentYear} - ${forecastYear}`, pageNumber: '105' },
              { id: 'subsec7-6-4', title: `Brazil ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '106' },
              { id: 'subsec7-6-5', title: `Argentina ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '107' },
              { id: 'subsec7-6-6', title: `Rest of Latin America ${segment} Market Revenue, ${currentYear - 4} - ${forecastYear - 1} (USD Billion)`, pageNumber: '108' }
            ]
          }
        ]
      },
      {
        id: 'ch8',
        title: `${segment} Market – Industry Analysis`,
        pageNumber: '110',
        sections: [
          {
            id: 'sec8-1',
            title: 'Introduction',
            pageNumber: '111',
            subsections: []
          },
          {
            id: 'sec8-2',
            title: 'Market Drivers',
            pageNumber: '112',
            subsections: [
              { id: 'subsec8-2-1', title: 'Driving Factor 1 Analysis', pageNumber: '113' },
              { id: 'subsec8-2-2', title: 'Driving Factor 2 Analysis', pageNumber: '114' }
            ]
          },
          {
            id: 'sec8-3',
            title: 'Market Restraints',
            pageNumber: '115',
            subsections: [
              { id: 'subsec8-3-1', title: 'Restraining Factor Analysis', pageNumber: '116' }
            ]
          },
          {
            id: 'sec8-4',
            title: 'Market Opportunities',
            pageNumber: '117',
            subsections: [
              { id: 'subsec8-4-1', title: 'Market Opportunity Analysis', pageNumber: '118' },
              { id: 'subsec8-4-2', title: "Porter's Five Forces Analysis", pageNumber: '119' }
            ]
          },
          {
            id: 'sec8-5',
            title: 'PESTEL Analysis',
            pageNumber: '120',
            subsections: []
          },
          {
            id: 'sec8-6',
            title: 'Regulatory Landscape',
            pageNumber: '121',
            subsections: []
          },
          {
            id: 'sec8-7',
            title: 'Technology Landscape',
            pageNumber: '122',
            subsections: []
          },
          {
            id: 'sec8-8',
            title: 'Regional Market Trends',
            pageNumber: '123',
            subsections: [
              { id: 'subsec8-8-1', title: 'North America', pageNumber: '124' },
              { id: 'subsec8-8-2', title: 'Europe', pageNumber: '125' },
              { id: 'subsec8-8-3', title: 'Asia Pacific', pageNumber: '126' },
              { id: 'subsec8-8-4', title: 'Latin America', pageNumber: '127' },
              { id: 'subsec8-8-5', title: 'The Middle East and Africa', pageNumber: '128' }
            ]
          },
          {
            id: 'sec8-9',
            title: 'Downstream Buyers',
            pageNumber: '129',
            subsections: []
          },
          {
            id: 'sec8-10',
            title: 'Distributors/Traders List',
            pageNumber: '130',
            subsections: []
          }
        ]
      },
      {
        id: 'ch9',
        title: 'Competitive Landscape',
        pageNumber: '132',
        sections: [
          {
            id: 'sec9-1',
            title: 'Company Market Share Analysis – 2024',
            pageNumber: '133',
            subsections: [
              { id: 'subsec9-1-1', title: `Global ${segment} Market: Company Market Share, 2024`, pageNumber: '134' }
            ]
          },
          {
            id: 'sec9-2',
            title: `Global ${segment} Market Company Market Share, 2024`,
            pageNumber: '135',
            subsections: []
          },
          {
            id: 'sec9-3',
            title: 'Strategic Developments',
            pageNumber: '136',
            subsections: [
              { id: 'subsec9-3-1', title: 'Acquisitions & Mergers', pageNumber: '137' },
              { id: 'subsec9-3-2', title: 'New Product Launch', pageNumber: '138' },
              { id: 'subsec9-3-3', title: 'Regional Expansion', pageNumber: '139' }
            ]
          },
          {
            id: 'sec9-4',
            title: 'Company Strategic Developments – Heat Map Analysis',
            pageNumber: '140',
            subsections: []
          }
        ]
      },
      {
        id: 'ch10',
        title: 'Company Profiles',
        pageNumber: '142',
        sections: generateCompanyProfiles()
      }
    ]
  };
}

// Generate company profiles sections
function generateCompanyProfiles() {
  const companies = [
    'Johnson & Johnson', 'Pfizer Inc.', 'Medtronic PLC',
    'Abbott Laboratories', 'Siemens Healthineers', 'Roche Holding AG',
    'Novartis AG', 'Merck & Co.', 'GE Healthcare', 'Boston Scientific'
  ];

  return companies.map((company, index) => {
    const basePageNum = 143 + (index * 8);
    return {
      id: `sec10-${index + 1}`,
      title: company,
      pageNumber: basePageNum.toString(),
      subsections: [
        { id: `subsec10-${index + 1}-1`, title: 'Company Overview', pageNumber: (basePageNum + 1).toString() },
        { id: `subsec10-${index + 1}-2`, title: 'Key Executives', pageNumber: (basePageNum + 2).toString() },
        { id: `subsec10-${index + 1}-3`, title: 'Product Portfolio', pageNumber: (basePageNum + 3).toString() },
        { id: `subsec10-${index + 1}-4`, title: 'Financial Overview', pageNumber: (basePageNum + 4).toString() },
        { id: `subsec10-${index + 1}-5`, title: 'Operating Business Segments', pageNumber: (basePageNum + 5).toString() },
        { id: `subsec10-${index + 1}-6`, title: 'Business Performance', pageNumber: (basePageNum + 6).toString() },
        { id: `subsec10-${index + 1}-7`, title: 'Recent Developments', pageNumber: (basePageNum + 7).toString() }
      ]
    };
  });
}

// Generate key players
function generateKeyPlayers(segment) {
  const companies = [
    { name: 'Johnson & Johnson', marketShare: '15.2%', description: 'Global leader in pharmaceuticals and medical devices' },
    { name: 'Pfizer Inc.', marketShare: '12.8%', description: 'Leading pharmaceutical company with strong R&D pipeline' },
    { name: 'Medtronic PLC', marketShare: '10.4%', description: 'Major medical device manufacturer with global presence' },
    { name: 'Abbott Laboratories', marketShare: '8.7%', description: 'Diversified healthcare company focusing on diagnostics and nutrition' },
    { name: 'Siemens Healthineers', marketShare: '7.3%', description: 'Leading provider of medical imaging and diagnostics equipment' },
    { name: 'Roche Holding AG', marketShare: '6.9%', description: 'Global pioneer in pharmaceuticals and diagnostics' },
    { name: 'Novartis AG', marketShare: '5.8%', description: 'Innovative pharmaceutical company with focus on specialty medicines' },
    { name: 'Merck & Co.', marketShare: '5.2%', description: 'Research-driven pharmaceutical company with diverse portfolio' }
  ];

  return companies;
}

// Generate FAQs
function generateFAQs(segment) {
  return [
    {
      question: `What is the current size of the ${segment} market?`,
      answer: `The ${segment} market is valued at approximately $${randomInt(10, 500)} billion in ${new Date().getFullYear()} and is expected to grow significantly over the forecast period.`
    },
    {
      question: 'What are the key factors driving market growth?',
      answer: 'Key growth drivers include technological advancements, increasing healthcare expenditure, aging population, rising prevalence of chronic diseases, and growing demand for quality healthcare services.'
    },
    {
      question: 'Which region dominates the market?',
      answer: 'North America currently holds the largest market share due to advanced healthcare infrastructure, high healthcare spending, and presence of major industry players.'
    },
    {
      question: 'Who are the major players in the market?',
      answer: 'Major players include Johnson & Johnson, Pfizer, Medtronic, Abbott Laboratories, and Siemens Healthineers, among others.'
    }
  ];
}

// Generate report data
function generateReport(index, categoryId) {
  const segment = marketSegments[index % marketSegments.length];
  const title = `${segment} Market Analysis ${new Date().getFullYear()} - ${new Date().getFullYear() + 5}`;
  const currentYear = new Date().getFullYear();
  const currentRevenue = randomInt(50, 800);
  const forecastRevenue = Math.round(currentRevenue * (1 + randomInt(5, 15) / 100) ** 5);
  const cagr = ((Math.pow(forecastRevenue / currentRevenue, 1 / 5) - 1) * 100).toFixed(1);

  return {
    title,
    slug: slugify(title) + '-' + index,
    summary: `This comprehensive report provides an in-depth analysis of the ${segment.toLowerCase()} market, covering market size, growth trends, competitive landscape, and future opportunities. The report examines key market drivers, challenges, and emerging trends that will shape the industry over the next five years.`,
    description: `Detailed market research report analyzing the ${segment.toLowerCase()} sector with comprehensive insights into market dynamics, competitive positioning, and strategic recommendations for stakeholders.`,
    category_id: categoryId,
    geography: randomPick(geographies),
    price: randomInt(2500, 15000),
    discountedPrice: randomInt(2000, 12000),
    currency: 'USD',
    status: randomInt(0, 10) > 2 ? 'published' : 'draft',
    pageCount: randomInt(150, 500),
    formats: randomPick(reportFormats),
    isFeatured: randomInt(0, 10) > 7,
    market_metrics: {
      currentRevenue: `$${currentRevenue} Billion USD`,
      currentYear,
      forecastRevenue: `$${forecastRevenue} Billion USD`,
      forecastYear: currentYear + 5,
      cagr: `${cagr}%`,
      cagrStartYear: currentYear,
      cagrEndYear: currentYear + 5
    },
    sections: {
      marketDetails: `<p>The ${segment.toLowerCase()} market encompasses various sub-segments, each with distinct characteristics and growth dynamics. Product innovation, quality improvements, and cost optimization are key focus areas for market participants.</p><p>Distribution channels include direct sales, distributors, and online platforms. The choice of distribution channel depends on product type, target customer segment, and geographic market. Companies are increasingly adopting omnichannel strategies to maximize market reach.</p><p>Pricing strategies vary based on product positioning, target market, competitive landscape, and regulatory considerations. Value-based pricing models are gaining traction as healthcare systems focus on outcomes and cost-effectiveness.</p>`,
      tableOfContents: JSON.stringify(generateTableOfContents(segment)),
      keyPlayers: JSON.stringify(generateKeyPlayers(segment))
    },
    faqs: generateFAQs(segment),
    meta_title: `${segment} Market Research Report ${currentYear}-${currentYear + 5}`,
    meta_description: `Comprehensive ${segment.toLowerCase()} market analysis covering size, trends, competitive landscape, and growth opportunities. In-depth research report with ${randomInt(150, 500)} pages of insights.`,
    meta_keywords: `${segment.toLowerCase()}, market research, market analysis, market forecast, healthcare`,
    internalNotes: `Generated sample report ${index + 1} for testing and development purposes.`
  };
}

// Main function to seed reports
async function seedReports() {
  if (!AUTH_TOKEN) {
    console.error('❌ Error: AUTH_TOKEN environment variable is required');
    process.exit(1);
  }

  console.log('🚀 Starting report seeding process...');
  console.log(`📡 API URL: ${API_BASE_URL}`);
  console.log('');

  // First, fetch available categories
  console.log('📋 Fetching categories...');
  let categories = [];
  try {
    const response = await fetch(`${API_BASE_URL}/v1/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }

    const result = await response.json();
    if (result.success && result.data && result.data.length > 0) {
      categories = result.data;
      console.log(`✅ Found ${categories.length} categories`);
    } else {
      console.log('⚠️  No categories found, using default category ID: 1');
      categories = [{ id: 1, name: 'Default' }];
    }
  } catch (error) {
    console.error('⚠️  Failed to fetch categories:', error.message);
    console.log('⚠️  Using default category ID: 1');
    categories = [{ id: 1, name: 'Default' }];
  }

  console.log('');
  console.log('📝 Creating 50 sample reports...');
  console.log('');

  let successCount = 0;
  let failCount = 0;
  const errors = [];

  for (let i = 0; i < 5; i++) {
    const categoryId = categories[i % categories.length].id;
    const reportData = generateReport(i, categoryId);
    try {
      const response = await fetch(`${API_BASE_URL}/v1/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${AUTH_TOKEN}`
        },
        body: JSON.stringify(reportData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        successCount++;
        console.log(`✅ [${successCount + failCount}/50] Created: ${reportData.title.substring(0, 60)}...`);
      } else {
        failCount++;
        const errorMsg = result.error || response.statusText;
        console.log(`❌ [${successCount + failCount}/50] Failed: ${reportData.title.substring(0, 60)}...`);
        console.log(`   Error: ${errorMsg}`);
        errors.push({ index: i + 1, title: reportData.title, error: errorMsg });
      }
    } catch (error) {
      failCount++;
      console.log(`❌ [${successCount + failCount}/50] Failed: ${reportData.title.substring(0, 60)}...`);
      console.log(`   Error: ${error.message}`);
      errors.push({ index: i + 1, title: reportData.title, error: error.message });
    }

    // Add a small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('');
  console.log('═'.repeat(80));
  console.log('📊 SUMMARY');
  console.log('═'.repeat(80));
  console.log(`✅ Successfully created: ${successCount} reports`);
  console.log(`❌ Failed: ${failCount} reports`);
  console.log('═'.repeat(80));

  if (errors.length > 0) {
    console.log('');
    console.log('📋 Error Details:');
    errors.forEach(err => {
      console.log(`   ${err.index}. ${err.title.substring(0, 50)}...`);
      console.log(`      → ${err.error}`);
    });
  }

  if (successCount === 50) {
    console.log('');
    console.log('🎉 All reports created successfully!');
  } else if (successCount > 0) {
    console.log('');
    console.log('⚠️  Some reports failed to create. Check the errors above.');
  } else {
    console.log('');
    console.log('❌ No reports were created. Please check your authentication token and API configuration.');
  }
}

// Run the script
seedReports().catch(error => {
  console.error('');
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});
