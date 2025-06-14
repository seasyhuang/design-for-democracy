"use client";

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import styles from './styles.module.css';

// Mock tax breakdown data for Canadian federal spending
const mockTaxData = [
  { name: 'Healthcare', value: 1200, color: '#FF6B6B', description: 'Your tax dollars help fund universal healthcare, ensuring all Canadians have access to medical care when they need it most.' },
  { name: 'Military & Defense', value: 800, color: '#4ECDC4', description: 'Supports our armed forces and national security, protecting our borders and contributing to global peacekeeping missions.' },
  { name: 'Debt Interest', value: 500, color: '#45B7D1', description: 'Pays interest on government debt from past spending, including pandemic relief and infrastructure investments.' },
  { name: 'Environment & Climate', value: 300, color: '#96CEB4', description: 'Funds environmental protection, climate action initiatives, and renewable energy programs for a sustainable future.' },
  { name: 'Housing & Infrastructure', value: 400, color: '#FFEAA7', description: 'Invests in affordable housing, roads, bridges, and public infrastructure that connects our communities.' },
  { name: 'Policing & Justice', value: 250, color: '#DDA0DD', description: 'Supports law enforcement, courts, and correctional services to maintain public safety and justice.' },
  { name: 'Education & Research', value: 350, color: '#FFB347', description: 'Funds education programs, scientific research, and innovation that drives our economy forward.' },
  { name: 'Social Services', value: 200, color: '#98D8C8', description: 'Provides support for vulnerable populations, including seniors, children, and those in need of assistance.' }
];

// Default values for average Canadian
const defaultIncome = 65000;
const defaultTaxPaid = 8500;

export default function TaxImpactMVP() {
  const [step, setStep] = useState(1);
  const [income, setIncome] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showActions, setShowActions] = useState(false);

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
        window.open('https://www.canada.ca/en/services/taxes.html', '_blank');
        break;
      case 'contact':
        const subject = encodeURIComponent('Tax Spending Transparency');
        const body = encodeURIComponent('I would like to learn more about how my tax dollars are being spent and support greater transparency in government spending.');
        window.open(`mailto:your.mp@parl.gc.ca?subject=${subject}&body=${body}`);
        break;
      case 'share':
        const shareText = encodeURIComponent(`I just learned where my tax dollars go! Check out this breakdown: ${window.location.href}`);
        window.open(`https://twitter.com/intent/tweet?text=${shareText}`);
        break;
      case 'feel':
        alert('💙 Remember: Your taxes are an investment in our shared future. Every dollar contributes to making Canada a better place for everyone!');
        break;
    }
  };

  const totalTax = mockTaxData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {step === 1 && (
          <div className={styles.landing}>
            <h1 className={styles.headline}>
              Ever wonder where your taxes go?
            </h1>
            <p className={styles.subtitle}>
              Discover how your tax dollars are spent and feel connected to the impact they make in your community.
            </p>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Your income (optional)"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className={styles.input}
                />
                <input
                  type="text"
                  placeholder="Postal code (optional)"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.button}>
                Show me the breakdown
              </button>
            </form>
            
            <p className={styles.note}>
              {!income && !postalCode && "Using average Canadian data for demonstration"}
            </p>
          </div>
        )}

        {step === 2 && (
          <div className={styles.breakdown}>
            <h2 className={styles.breakdownTitle}>
              Your Tax Dollar Breakdown
            </h2>
            <p className={styles.breakdownSubtitle}>
              Based on {income ? `$${parseInt(income).toLocaleString()}` : `$${defaultIncome.toLocaleString()}`} annual income
            </p>

            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={mockTaxData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    onClick={handleCategoryClick}
                    className={styles.pieChart}
                  >
                    {mockTaxData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`$${value}`, 'Amount']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {selectedCategory && (
              <div className={styles.categoryInfo}>
                <h3>{selectedCategory.name}</h3>
                <p>{selectedCategory.description}</p>
                <p className={styles.amount}>${selectedCategory.value} of your tax dollars</p>
              </div>
            )}

            {showActions && (
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
              </div>
            )}

            <button 
              onClick={() => setStep(1)}
              className={styles.backButton}
            >
              ← Start Over
            </button>
          </div>
        )}
      </main>
    </div>
  );
} 