# Tax Impact MVP

## 🎯 Project Overview

A minimal interactive web tool that helps users understand where their Canadian tax dollars go, feel emotionally connected to that information, and take meaningful next steps.

## 🚀 Features

### Step 1: Landing Page
- Simple, engaging headline: "Ever wonder where your taxes go?"
- Optional form inputs for income and postal code
- Default values for average Canadian if no input provided
- Clean, modern UI with gradient design

### Step 2: Tax Breakdown Visualization
- Interactive pie chart showing spending categories
- Clickable categories with detailed descriptions
- Mock data for Canadian federal spending including:
  - Healthcare
  - Military & Defense
  - Debt Interest
  - Environment & Climate
  - Housing & Infrastructure
  - Policing & Justice
  - Education & Research
  - Social Services

### Step 3: Action Prompts
- **Learn More**: Links to official Canadian tax information
- **Contact Your MP**: Pre-filled email template
- **Share**: Social media sharing functionality
- **Feel Better**: Positive messaging about tax impact

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with React 19
- **Charts**: Recharts for interactive data visualization
- **Styling**: CSS Modules with modern design
- **Language**: TypeScript for type safety

## 📦 Setup Instructions

1. **Navigate to the prototype directory:**
   ```bash
   cd app/prototypes/tax-impact-mvp
   ```

2. **Install dependencies (if not already installed):**
   ```bash
   npm install recharts
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:3000/prototypes/tax-impact-mvp
   ```

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Gradient backgrounds, smooth animations, and clean typography
- **Interactive Elements**: Hover effects, click animations, and smooth transitions
- **Accessibility**: Proper contrast ratios and keyboard navigation support

## 📊 Data Structure

The prototype uses mock data representing Canadian federal spending:

```json
{
  "healthcare": 1200,
  "military": 800,
  "debt_interest": 500,
  "environment": 300,
  "housing": 400,
  "policing": 250,
  "education": 350,
  "social_services": 200
}
```

## 🔧 Customization

### Adding Real Data
Replace the `mockTaxData` array in `page.tsx` with actual Canadian government spending data.

### Modifying Categories
Update the spending categories and descriptions to match your specific needs.

### Styling Changes
Modify `styles.module.css` to adjust colors, fonts, and layout.

## 🎯 User Journey

1. **Landing**: User sees engaging headline and optional input form
2. **Input**: User can enter income/postal code or use default values
3. **Visualization**: Interactive pie chart shows tax breakdown
4. **Exploration**: User clicks categories to learn more
5. **Action**: User chooses from four meaningful next steps
6. **Engagement**: User feels connected to their tax impact

## 🚀 Future Enhancements

- Integration with real Canadian government APIs
- Provincial tax breakdowns
- Historical spending comparisons
- Personalized recommendations based on user interests
- Email newsletter signup for tax transparency updates

## 📝 Notes for Students

This prototype demonstrates:
- Modern React patterns with hooks
- Interactive data visualization
- User-centered design principles
- Emotional engagement through storytelling
- Clear call-to-action implementation

Perfect for learning about building engaging, data-driven web applications! 