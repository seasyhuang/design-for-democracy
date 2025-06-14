"use client";

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import styles from './styles/home.module.css';
import { calculateTaxes, getTaxSummary, formatCurrency } from './utils/taxCalculator';
import Image from 'next/image';

// Updated 2024 Canadian government spending breakdown
const SPENDING_CATEGORIES = [
  { name: "General public services", percentage: 0.15, color: "#6C63FF", description: "Funds government administration, international relations, and core public services that keep our country running smoothly." },
  { name: "Defence", percentage: 0.02, color: "#FF6584", description: "Supports our armed forces, national security, and contributes to global peacekeeping missions to protect our borders and allies." },
  { name: "Public order and safety", percentage: 0.05, color: "#43e97b", description: "Funds law enforcement, courts, correctional services, and emergency response to maintain public safety and justice." },
  { name: "Economic affairs", percentage: 0.10, color: "#FFD166", description: "Invests in economic development, transportation infrastructure, and programs that support business growth and job creation." },
  { name: "Environmental protection", percentage: 0.03, color: "#00BFAE", description: "Funds environmental protection, climate action initiatives, and programs to preserve our natural resources for future generations." },
  { name: "Housing and community amenities", percentage: 0.01, color: "#FFB347", description: "Supports affordable housing programs, community development, and local infrastructure projects." },
  { name: "Health", percentage: 0.23, color: "#4facfe", description: "Funds our universal healthcare system, medical research, and public health programs to keep Canadians healthy and safe." },
  { name: "Recreation, culture and religion", percentage: 0.02, color: "#A259FF", description: "Supports arts, culture, sports, and recreational programs that enrich our communities and national identity." },
  { name: "Education", percentage: 0.12, color: "#F67280", description: "Funds education programs, scientific research, and innovation that drives our economy and prepares future generations." },
  { name: "Social protection", percentage: 0.26, color: "#2D9CDB", description: "Provides support for seniors, children, families, and vulnerable populations through social assistance and welfare programs." }
];

// Default values for average Canadian
const defaultIncome = 65000;

// Type guard for legend payload
function isSpendingCategoryPayload(payload: any): payload is { name: string; value: number } {
  return payload && typeof payload.name === 'string' && typeof payload.value === 'number';
}

const causes = [
  { label: "Health", color: "rgba(67, 233, 123, 0.8)", emoji: "🏥", nudge: "This could fund {n} ER visits", baseUnit: 3, perAmount: 1000 / 3 },
  { label: "Environment", color: "rgba(0, 191, 174, 0.8)", emoji: "🌱", nudge: "This powers {n} homes with solar", baseUnit: 10, perAmount: 1000 / 10 },
  { label: "Housing", color: "rgba(255, 179, 71, 0.8)", emoji: "🏠", nudge: "This covers {n} months of rent subsidy", baseUnit: 6, perAmount: 1200 / 6 },
  { label: "Transit", color: "rgba(67, 233, 123, 0.8)", emoji: "🚌", nudge: "This pays for {n} monthly bus passes", baseUnit: 6, perAmount: 600 / 6 },
  { label: "Education", color: "rgba(255, 209, 102, 0.8)", emoji: "🎓", nudge: "This funds school supplies for {n} classrooms", baseUnit: 4, perAmount: 800 / 4 },
  { label: "Policing", color: "rgba(45, 156, 219, 0.8)", emoji: "🚓", nudge: "This supports {n} patrol hours", baseUnit: 10, perAmount: 500 / 10 }
];

function CauseBubbleSelector({ selected, onSelect }: { selected: string[]; onSelect: (label: string) => void }) {
  return (
    <div className={styles.causeBubbleGroup}>
      {causes.map((cause) => {
        const isSelected = selected.includes(cause.label);
        return (
          <button
            type="button"
            key={cause.label}
            className={
              styles.causeBubble +
              (isSelected ? ' ' + styles.causeBubbleSelected : '')
            }
            style={isSelected ? { background: cause.color, color: '#fff', borderColor: cause.color } : {}}
            onClick={() => onSelect(cause.label)}
          >
            {isSelected && <span style={{ marginRight: 8 }}>{cause.emoji}</span>}
            {cause.label}
          </button>
        );
      })}
    </div>
  );
}

// Map chart category names to cause labels
const categoryToCauseLabel: Record<string, string> = {
  "Healthcare": "Health",
  "Health": "Health",
  "Environment & Climate": "Environment",
  "Environment": "Environment",
  "Housing & Infrastructure": "Housing",
  "Housing": "Housing",
  "Transit": "Transit",
  "Education & Research": "Education",
  "Education": "Education",
  "Policing & Justice": "Policing",
  "Policing": "Policing",
};

// Mock organizations by cause
const orgsByCause: Record<string, Array<{ emoji: string; name: string; desc: string }>> = {
  Health: [
    { emoji: "🏥", name: "Montreal Health Volunteers", desc: "Support patients at local hospitals." },
    { emoji: "🩺", name: "ER Friends", desc: "Help with ER wait room comfort and info." }
  ],
  Environment: [
    { emoji: "🌱", name: "EcoMontréal", desc: "Urban gardening volunteer program." },
    { emoji: "🧼", name: "Clean Streets Initiative", desc: "Weekend cleanups in your borough." }
  ],
  Housing: [
    { emoji: "🏠", name: "Shelter Helpers", desc: "Volunteer at local shelters and food banks." },
    { emoji: "🔑", name: "Keys to Home", desc: "Support affordable housing projects." }
  ],
  Transit: [
    { emoji: "🚌", name: "Bus Buddies", desc: "Assist seniors with public transit navigation." },
    { emoji: "🚲", name: "Bike Montreal", desc: "Community bike repair and safety events." }
  ],
  Education: [
    { emoji: "📚", name: "Read Together", desc: "Tutor kids in after-school reading programs." },
    { emoji: "🖍️", name: "Classroom Champions", desc: "Help teachers with classroom activities." }
  ],
  Policing: [
    { emoji: "🚓", name: "Safe Streets Patrol", desc: "Neighborhood watch and safety walks." },
    { emoji: "🤝", name: "Community Mediation", desc: "Support conflict resolution in your area." }
  ]
};

function VolunteerOrgsList({ selectedCauses, postalCode }: { selectedCauses: string[]; postalCode: string }) {
  // For demo, just use the first 2 orgs per selected cause
  const orgs = selectedCauses
    .flatMap((cause) => orgsByCause[cause] || [])
    .slice(0, 3);
  // Debug log
  console.log('VolunteerOrgsList selectedCauses:', selectedCauses, 'orgs:', orgs);
  if (orgs.length === 0) return (
    <div className={styles.volunteerOrgsSection}>
      <div className={styles.volunteerOrgsTitle}>Volunteer opportunities</div>
      <div className={styles.volunteerOrgDesc}>No organizations found for your selected causes.</div>
    </div>
  );
  const location = postalCode ? `in your area (${postalCode.toUpperCase()})` : "near you";
  return (
    <div className={styles.volunteerOrgsSection}>
      <div className={styles.volunteerOrgsTitle}>Volunteer opportunities {location}:</div>
      <ul className={styles.volunteerOrgsList}>
        {orgs.map((org, i) => (
          <li key={org.name + i} className={styles.volunteerOrgItem}>
            <span className={styles.volunteerOrgEmoji}>{org.emoji}</span>
            <div className={styles.volunteerOrgInfo}>
              <div className={styles.volunteerOrgName}>{org.name}</div>
              <div className={styles.volunteerOrgDesc}>{org.desc}</div>
            </div>
            <button className={styles.volunteerOrgButton}>Sign Up</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showActions, setShowActions] = useState(false);
  const [selectedCauses, setSelectedCauses] = useState<string[]>([]);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [showShareImage, setShowShareImage] = useState(false);
  const [showNewsImage, setShowNewsImage] = useState(false);

  // Remove fade/factIndex logic and just show the first fact for marquee
  const splashFacts = SPENDING_CATEGORIES.map(cat => `Did you know… ${(cat.percentage * 100).toFixed(0)}% of your taxes goes to ${cat.name}?`);
  const marqueeText = splashFacts.join('   •   ');

  // Debug log for selectedCauses
  console.log('Home selectedCauses:', selectedCauses);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCategoryClick = (data: any) => {
    setSelectedCategory(data);
    setShowActions(true);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'learn':
        setShowNewsImage((prev) => !prev);
        setShowShareImage(false);
        break;
      case 'contact':
        window.open('https://www.figma.com/proto/gWblOhMYcrktGdCghNvxKM/Parliamentary-Newsletter?page-id=0%3A1&node-id=26-1535&viewport=-566%2C430%2C0.08&t=VHVDLXUnMytASPeV-1&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=6%3A443&show-proto-sidebar=1', '_blank');
        setShowShareImage(false);
        break;
      case 'share':
        setShowShareImage((prev) => !prev);
        setShowNewsImage(false);
        break;
      case 'feel':
        window.open('https://www.youtube.com/watch?v=kRBV_sllVvw', '_blank');
        setShowShareImage(false);
        break;
    }
  };

  const handleCauseSelect = (label: string) => {
    setSelectedCauses((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  };

  // Calculate taxes and spending breakdown
  const currentIncome = income ? parseInt(income) : defaultIncome;
  const taxSummary = getTaxSummary(currentIncome);
  const totalTax = taxSummary.totalTax;

  // Generate spending data based on calculated taxes
  const spendingData = SPENDING_CATEGORIES.map(category => ({
    name: category.name,
    value: Math.round(totalTax * category.percentage),
    color: category.color,
    description: category.description,
    percentage: category.percentage
  }));

  return (
    <div className={styles.container}>
      {step === 1 && (
        <div className={styles.splashMarqueeWrapper}>
          <div className={styles.splashMarquee}>
            <span>{marqueeText}</span>
          </div>
        </div>
      )}
      <main className={styles.main}>
        {step === 1 && (
          <div className={styles.landingWrapper}>
            <div className={styles.landing}>
              <h1 className={styles.headline}>
              Payback time
              </h1>
              <p className={styles.subtitle}>
                See where your tax dollars go and feel connected to the impact they make in your community.
              </p>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup}>
                  <input
                    type="number"
                    placeholder="Your annual income (optional)"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className={styles.input}
                    min="0"
                  />
                  <input
                    type="text"
                    placeholder="Postal code (optional)"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={styles.input}
                  />
                </div>
                {/* Bubble selector for causes */}
                <div className={styles.causeSelectorSection}>
                  <label className={styles.causeSelectorLabel}>What causes do you care about?</label>
                  <CauseBubbleSelector selected={selectedCauses} onSelect={handleCauseSelect} />
                  <div className={styles.causeSelectorHint}>
                    <span>Select one or more to personalize your results (optional)</span>
                  </div>
                </div>
                <button type="submit" className={styles.button}>
                  Calculate my tax breakdown
                </button>
              </form>
              <p className={styles.note}>
                {!income && "Using average Canadian income ($65,000) for demonstration"}
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.dashboardWrapper}>
            <header className={styles.dashboardHeader}>
              <h2>💰 Payback time 💰</h2>
            </header>
            <div className={styles.dashboard}>
              {/* Left Column: Tax Summary + Chart */}
              <div className={styles.leftColumn}>
                <div className={styles.taxSummary}>
                  <div className={styles.taxInfo}>
                    <h3>Your Tax Summary</h3>
                    <p><strong>Total Taxes:</strong> {formatCurrency(totalTax)}</p>
                    <p><strong>Effective Tax Rate:</strong> {taxSummary.effectiveRate}%</p>
                    <p><strong>Net Income:</strong> {formatCurrency(taxSummary.netIncome)}</p>
                    <p className={styles.taxNote}>
                      <em>
                        This demo assumes: employment income only (no self-employment or deductions), 2024 combined Federal + Québec rates, and a simplified spending breakdown. Actual taxes may vary.
                      </em>
                    </p>
                  </div>
                </div>
                {/* Chart Type Toggle */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setChartType('pie')}
                    className={chartType === 'pie' ? styles.chartToggleActive : styles.chartToggle}
                  >
                    Pie Chart
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={chartType === 'bar' ? styles.chartToggleActive : styles.chartToggle}
                  >
                    Bar Chart
                  </button>
                </div>
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={500}>
                    {chartType === 'pie' ? (
                      <PieChart>
                        <Pie
                          data={spendingData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          onClick={(_, index) => {
                            const clicked = spendingData[index];
                            setSelectedCategory(
                              selectedCategory && selectedCategory.name === clicked.name
                                ? null
                                : clicked
                            );
                          }}
                          className={styles.pieChart}
                        >
                          {spendingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const percent = props && props.payload && typeof props.payload.percentage === 'number'
                              ? ` (${Math.round(props.payload.percentage * 100)}%)`
                              : '';
                            return [`${formatCurrency(value as number)}${percent}`, 'Amount'];
                          }}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Legend />
                      </PieChart>
                    ) : (
                      <BarChart data={spendingData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
                        <YAxis tickFormatter={formatCurrency} />
                        <Tooltip 
                          formatter={(value, name, props) => {
                            const percent = props && props.payload && typeof props.payload.percentage === 'number'
                              ? ` (${Math.round(props.payload.percentage * 100)}%)`
                              : '';
                            return [`${formatCurrency(value as number)}${percent}`, 'Amount'];
                          }}
                          labelFormatter={(label) => `${label}`}
                        />
                        <Legend />
                        <Bar dataKey="value">
                          {spendingData.map((entry, index) => (
                            <Cell key={`cell-bar-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                  <div className={styles.chartSourceNote}>
                    Percentages are based on <a href="https://www150.statcan.gc.ca/n1/daily-quotidien/241127/cg-a002-eng.htm" target="_blank" rel="noopener noreferrer">Statistics Canada, 2023 government expenses by function</a>.
                  </div>
                </div>
              </div>
              {/* Right Column: Category Info + Nudges + Actions */}
              <div className={styles.rightColumn}>
                <div className={styles.categoryInfoWrapper}>
                  {selectedCategory ? (
                    <div className={styles.categoryInfo}>
                      <h3>{selectedCategory.name}</h3>
                      <p>{selectedCategory.description}</p>
                      <p className={styles.amount}>
                        {formatCurrency(selectedCategory.value)} of your tax dollars 
                        ({(selectedCategory.percentage * 100).toFixed(0)}%)
                      </p>
                    </div>
                  ) : (
                    <div className={styles.categoryInfoDefault}>
                      <h3>Select a category</h3>
                      <p>Click a section of the chart to learn more about how your tax dollars are spent in that area.</p>
                    </div>
                  )}
                </div>
                {/* Personalized nudges now in the right column */}
                {(() => {
                  // If a chart category is selected, show only its nudge (if available)
                  if (selectedCategory) {
                    const mappedLabel = categoryToCauseLabel[selectedCategory.name] || selectedCategory.name;
                    const cause = causes.find((c) => c.label === mappedLabel);
                    if (cause) {
                      // Calculate how many units this value could fund
                      const n = Math.max(1, Math.round(selectedCategory.value / cause.perAmount));
                      const nudgeMsg = cause.nudge.replace('{n}', n.toString());
                      return (
                        <div className={styles.nudgeSummary}>
                          <div className={styles.nudgeMessage}>{nudgeMsg}</div>
                        </div>
                      );
                    }
                  }
                  // Otherwise, show up to 3 nudges for selected causes
                  if (selectedCauses.length > 0) {
                    return (
                      <div className={styles.nudgeSummary}>
                        {selectedCauses.slice(0, 3).map((causeLabel) => {
                          const cause = causes.find((c) => c.label === causeLabel);
                          return cause ? (
                            <div key={cause.label} className={styles.nudgeMessage}>
                              {cause.nudge.replace('{n}', cause.baseUnit.toString())}
                            </div>
                          ) : null;
                        })}
                      </div>
                    );
                  }
                  return null;
                })()}
                {/* Volunteer orgs below nudges, above actions */}
                <VolunteerOrgsList selectedCauses={selectedCauses} postalCode={postalCode} />
                <div className={styles.actions}>
                  <h3>What would you like to do next?</h3>
                  <div className={styles.actionButtons}>
                    <button 
                      onClick={() => handleAction('learn')}
                      className={styles.actionButton}
                    >
                      📚 Learn More
                    </button>
                    <button 
                      onClick={() => handleAction('contact')}
                      className={styles.actionButton}
                    >
                      📧 Contact Your MP
                    </button>
                    <button 
                      onClick={() => handleAction('share')}
                      className={styles.actionButton}
                    >
                      📤 Share This
                    </button>
                    <button 
                      onClick={() => handleAction('feel')}
                      className={styles.actionButton}
                    >
                      💙 Feel Better
                    </button>
                  </div>
                  {showNewsImage && (
                    <div className={styles.shareImageWrapper}>
                      <Image src="/payback-news.png" alt="Learn more news preview" width={800} height={400} style={{ width: '100%', height: 'auto', margin: '2rem 0 0 0', display: 'block' }} />
                    </div>
                  )}
                  {showShareImage && (
                    <div className={styles.overlay} onClick={() => setShowShareImage(false)}>
                      <div className={styles.overlayContent} onClick={e => e.stopPropagation()}>
                        <button className={styles.overlayClose} onClick={() => setShowShareImage(false)} aria-label="Close">✕</button>
                        <Image src="/payback-share-message.png" alt="Share message preview" width={800} height={400} style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '16px' }} />
                      </div>
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => setStep(1)}
                  className={styles.backButton}
                >
                  ← Start Over
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
