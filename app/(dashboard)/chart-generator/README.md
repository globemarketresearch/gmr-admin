# Chart Generator (EPIC 5)

A professional chart generation tool for creating market research visualizations with export capabilities.

## Features

### Chart Types

- **Bar Chart**: Vertical or horizontal bar charts
- **Stacked Bar Chart**: Grouped data visualization
- **Pie Chart**: Proportional data representation

### Data Input Methods

1. **Manual Entry**: Interactive table editor with add/remove rows and series
2. **CSV Import**: Upload CSV files with validation and error handling
3. **CSV Export**: Download chart data for backup or sharing

### Customization Options

- **Chart Metadata**
  - Title and subtitle
  - Axis labels (X and Y)
  - Unit suffix (B, M, K, etc.)
  - Decimal precision (0, 1, or 2 decimals)
  - Legend visibility
  - Gridlines toggle

- **Visual Styling**
  - Color themes (default palette or custom colors)
  - Chart orientation (vertical/horizontal)
  - Logo upload and positioning
  - Logo opacity control

### Export Capabilities

- **Formats**: PNG and WEBP
- **Resolution Presets**:
  - Standard: 1200 × 700
  - Full HD: 1920 × 1080
  - High-Res: 2400 × 1400
  - 4K: 3840 × 2160
  - Custom dimensions

### Configuration Management

- **Import/Export**: Save and load chart configurations as JSON
- **Validation**: Real-time validation with error messages
- **Preview**: Live preview before export

## File Structure

```
app/(dashboard)/chart-generator/
├── page.tsx                          # Main page with 3-panel layout
└── components/
    ├── chart-config-panel.tsx        # Chart type and style selection
    ├── chart-preview.tsx             # Real-time ECharts preview
    ├── color-picker.tsx              # Color selection component
    ├── csv-import-export.tsx         # CSV upload/download functionality
    ├── data-input-panel.tsx          # Metadata and data input
    ├── data-table-editor.tsx         # Interactive data table
    ├── export-preview-dialog.tsx     # Export preview modal
    ├── logo-uploader.tsx             # Logo upload and config
    └── preview-export-panel.tsx      # Export controls

contexts/
└── chart-generator-context.tsx       # Global state management

lib/
├── config/
│   └── chart-generator.ts            # Configuration constants
├── types/
│   └── chart-generator.ts            # TypeScript type definitions
└── utils/
    ├── chart-builder.ts              # ECharts config builder
    ├── chart-export.ts               # Image export utilities
    ├── chart-validation.ts           # Validation logic
    └── csv-parser.ts                 # CSV parsing and export

hooks/
└── use-chart-generator.ts            # Chart generator hook

public/
└── sample-chart-data.csv             # Sample CSV template
```

## Usage

### Accessing the Chart Generator

Navigate to `/chart-generator` in the dashboard.

### Creating a Chart

1. **Configure Chart Type** (Left Panel)
   - Select chart type (Bar, Stacked Bar, or Pie)
   - Choose orientation
   - Select color theme

2. **Input Data** (Middle Panel)
   - Enter chart title and metadata
   - Upload logo (optional)
   - Enter data manually or import CSV

3. **Preview & Export** (Right Panel)
   - Preview chart in real-time
   - Select export format and resolution
   - Download chart as image

### CSV Import Format

CSV files should follow this structure:

```csv
Category,Series1,Series2,Series3
2020,100,200,150
2021,120,220,160
2022,140,240,170
```

- **First column**: Category labels (X-axis)
- **Remaining columns**: Data series
- **Headers**: Series names

### Constraints

- **Maximum Rows**: 20
- **Maximum Series**: 8
- **Title Length**: 100 characters
- **Subtitle Length**: 150 characters
- **Label Length**: 50 characters
- **Logo File Size**: 2MB
- **Logo Formats**: PNG, SVG

## Technologies Used

- **ECharts**: Professional charting library
- **echarts-for-react**: React wrapper for ECharts
- **html-to-image**: HTML to image conversion
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Sonner**: Toast notifications

## Future Enhancements (Backend)

- Chart data persistence
- Server-side image generation
- Chart linking to reports and blogs
- Chart templates library
- Collaborative editing
- Version history

## Notes

- Charts are currently client-side only (POC phase)
- Logo images are stored in browser memory (not persisted)
- Configuration export saves settings as JSON (excludes logo file)
- Export quality is optimized for print and digital use
