import { useEffect, useState } from 'react';
import axios from 'axios';

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTx = async () => {
      const res = await axios.post('/api/plaid/fetch_transactions', { start_date: '2025-09-01', end_date: '2025-09-30' });
      alert(`Imported ${res.data.imported} transactions`);
      const allTx = await axios.get('/transactions');
      setTransactions(allTx.data);
    };
    fetchTx();
  }, []);

  return (
    <table className="table-auto border-collapse border border-gray-300">
      <thead>
        <tr>
          <th className="border px-2">Date</th>
          <th className="border px-2">Name</th>
          <th className="border px-2">Amount</th>
          <th className="border px-2">Category</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map(t => (
          <tr key={t.transaction_id}>
            <td className="border px-2">{t.date}</td>
            <td className="border px-2">{t.name}</td>
            <td className="border px-2">{t.amount}</td>
            <td className="border px-2">{t.category?.join(', ')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
