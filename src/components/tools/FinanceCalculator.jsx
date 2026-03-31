// src/components/tools/FinanceCalculator.jsx
import React, { useState, useMemo } from 'react';
import './Tools.css';

const FinanceCalculator = () => {
  const [values, setValues] = useState({
    carPrice:   25000,
    deposit:    5000,
    termMonths: 48,
    interestRate: 9.5,
  });

  const set = (key, val) => setValues(prev => ({ ...prev, [key]: Number(val) }));

  const result = useMemo(() => {
    const principal = values.carPrice - values.deposit;
    if (principal <= 0) return { monthly: 0, totalRepayable: 0, totalInterest: 0 };
    const monthlyRate = values.interestRate / 100 / 12;
    const n = values.termMonths;
    let monthly;
    if (monthlyRate === 0) {
      monthly = principal / n;
    } else {
      monthly = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
                (Math.pow(1 + monthlyRate, n) - 1);
    }
    const totalRepayable = monthly * n + values.deposit;
    const totalInterest  = totalRepayable - values.carPrice;
    return {
      monthly:        Math.round(monthly),
      totalRepayable: Math.round(totalRepayable),
      totalInterest:  Math.round(totalInterest),
    };
  }, [values]);

  return (
    <div className="tool-panel">
      <div className="tool-header">
        <h2>Finance Calculator</h2>
        <p>Estimate your monthly repayments instantly</p>
      </div>

      <div className="finance-body">
        <div className="finance-form">

          <div className="form-field">
            <label>Car Price: ${values.carPrice.toLocaleString()}</label>
            <input
              type="range"
              min="5000" max="1000000" step="500"
              value={values.carPrice}
              onChange={e => set('carPrice', e.target.value)}
            />
            <div className="range-labels"><span>$5,000</span><span>$1,000,000</span></div>
          </div>

          <div className="form-field">
            <label>Deposit: ${values.deposit.toLocaleString()}</label>
            <input
              type="range"
              min="0" max={values.carPrice * 0.5} step="500"
              value={values.deposit}
              onChange={e => set('deposit', e.target.value)}
            />
            <div className="range-labels"><span>$0</span><span>${(values.carPrice * 0.5).toLocaleString()}</span></div>
          </div>

          <div className="form-field">
            <label>Loan Term</label>
            <select value={values.termMonths} onChange={e => set('termMonths', e.target.value)}>
              <option value="12">12 months (1 year)</option>
              <option value="24">24 months (2 years)</option>
              <option value="36">36 months (3 years)</option>
              <option value="48">48 months (4 years)</option>
              <option value="60">60 months (5 years)</option>
            </select>
          </div>

          <div className="form-field">
            <label>Interest Rate: {values.interestRate}% p.a.</label>
            <input
              type="range"
              min="3" max="20" step="0.5"
              value={values.interestRate}
              onChange={e => set('interestRate', e.target.value)}
            />
            <div className="range-labels"><span>3%</span><span>20%</span></div>
          </div>

        </div>

        {/* Result card */}
        <div className="finance-result">
          <h3>Estimated Monthly Payment</h3>
          <div className="monthly-payment">
            <span>$</span>{result.monthly.toLocaleString()}
            <span style={{ fontSize: '18px' }}>/mo</span>
          </div>
          <div className="finance-breakdown">
            <div className="breakdown-row">
              <span>Loan amount</span>
              <span>${(values.carPrice - values.deposit).toLocaleString()}</span>
            </div>
            <div className="breakdown-row">
              <span>Deposit</span>
              <span>${values.deposit.toLocaleString()}</span>
            </div>
            <div className="breakdown-row">
              <span>Term</span>
              <span>{values.termMonths} months</span>
            </div>
            <div className="breakdown-row">
              <span>Total interest</span>
              <span>${result.totalInterest.toLocaleString()}</span>
            </div>
            <div className="breakdown-row">
              <span>Total repayable</span>
              <span>${result.totalRepayable.toLocaleString()}</span>
            </div>
          </div>
          <p className="finance-note">
            * Indicative only. Actual rates depend on your credit profile and lender terms. Contact us for a personalised finance quote.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinanceCalculator;