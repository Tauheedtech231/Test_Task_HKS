"use client"
import React, { useEffect, useState } from 'react'

const ExpenseTracker = () => {

  const [expenses, setExpenses] = useState([])
  const [filteredExpenses, setfilteredExpenses] = useState([])
  const [editId, setEditId] = useState(null)

  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: "",
    category: ""
  })

  const [filters, setFilters] = useState({
    category: "",
    from: "",
    to: ""
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handlefilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (form.amount < 0) return alert("amount cannot be negative")
    if (!form.name || !form.amount || !form.date || !form.category) {
      return alert("all fields required")
    }

    const stored = localStorage.getItem("expenses")
    const parsed = stored ? JSON.parse(stored) : []

    let updatedExpenses

    if (editId) {
      updatedExpenses = parsed.map((e) =>
        e.id === editId ? { ...form, id: editId } : e
      )
    } else {
      const newExpense = { ...form, id: Date.now() }
      updatedExpenses = [...parsed, newExpense]
    }

    localStorage.setItem("expenses", JSON.stringify(updatedExpenses))
    setExpenses(updatedExpenses)

    setForm({
      name: "",
      amount: "",
      date: "",
      category: ""
    })
    setEditId(null)
  }

  const fetchExpenses = () => {
    const stored = localStorage.getItem("expenses")
    const parsed = stored ? JSON.parse(stored) : []
    setExpenses(parsed)
    setfilteredExpenses(parsed)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchExpenses()
  }, [])

  useEffect(() => {
    let data = [...expenses]

    if (filters.category) {
      data = data.filter(e => e.category === filters.category)
    }

    if (filters.from) {
      data = data.filter(e => new Date(e.date) >= new Date(filters.from))
    }

    if (filters.to) {
      data = data.filter(e => new Date(e.date) <= new Date(filters.to))
    }

    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setfilteredExpenses(data)
  }, [filters, expenses])

  const handleEdit = (expense) => {
    setForm({
      name: expense.name,
      amount: expense.amount,
      date: expense.date,
      category: expense.category
    })
    setEditId(expense.id)
  }

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this expense?")
    if (!confirmDelete) return

    const stored = localStorage.getItem("expenses")
    const parsed = stored ? JSON.parse(stored) : []

    const filtered = parsed.filter(e => e.id !== id)
    localStorage.setItem("expenses", JSON.stringify(filtered))
    setExpenses(filtered)
  }

  const exportCSV = () => {
    if (filteredExpenses.length === 0) return alert("No data to export")

    const headers = ["Title", "Amount", "Date", "Category"]
    const rows = filteredExpenses.map(e => [e.name, e.amount, e.date, e.category])

    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(row => row.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "expenses.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  let totalexpenses = 0
  let monthExpenses = 0
  let filteredTotal = 0

  filteredExpenses.forEach((e) => {
    const amount = Number(e.amount)

    totalexpenses += amount
    filteredTotal += amount

    const d = new Date(e.date)
    const now = new Date()

    if (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    ) {
      monthExpenses += amount
    }
  })

  return (
    <div className='flex w-full min-h-screen'>

      <div className='w-[17rem] bg-white shadow-lg flex flex-col p-4 gap-6'>

        <h2 className='text-xl text-black font-bold'>
          {editId ? "Edit Expense" : "Add Expense"}
        </h2>

        <form onSubmit={handleSubmit} className='flex flex-col gap-3'>

          <input name="name" value={form.name} onChange={handleChange} placeholder='Title' className='border text-black p-2 rounded-md' />
          <input name="amount" value={form.amount} onChange={handleChange} type="number" placeholder='Amount' className='border text-black p-2 rounded-md' />
          <input name="date" value={form.date} onChange={handleChange} type="date" className='border text-black p-2 rounded-md' />

          <select name="category" value={form.category} onChange={handleChange} className='border text-black p-2 rounded-md'>
            <option value="">Select category</option>
            <option value="food">Food</option>
            <option value="transportation">Transportation</option>
            <option value="entertainment">Entertainment</option>
          </select>

          <button className='bg-blue-600 text-white py-2 rounded-md'>
            {editId ? "Update Expense" : "Add Expense"}
          </button>
        </form>

        <div className='flex flex-col gap-2'>
          <h3 className='font-bold text-black'>Filters</h3>

          <select name="category" onChange={handlefilterChange} className='border text-black p-2 rounded-md'>
            <option value="">All Categories</option>
            <option value="food">Food</option>
            <option value="transportation">Transportation</option>
            <option value="entertainment">Entertainment</option>
          </select>

          <input type="date" name="from" onChange={handlefilterChange} className='border text-black p-2 rounded-md' />
          <input type="date" name="to" onChange={handlefilterChange} className='border text-black p-2 rounded-md' />

          <button
            onClick={exportCSV}
            className='bg-green-600 text-white py-2 rounded-md mt-2'
          >
            Export CSV
          </button>
        </div>

      </div>

      <div className='flex-1 bg-purple-100 text-black flex flex-col items-center'>

        <div className='flex gap-4 w-full px-6 py-4'>
          <div className='bg-purple-200 p-4 rounded-md w-full'>
            Total <div>{totalexpenses}</div>
          </div>
          <div className='bg-purple-200 p-4 rounded-md w-full'>
            This Month <div>{monthExpenses}</div>
          </div>
          <div className='bg-purple-200 p-4 rounded-md w-full'>
            Entries <div>{filteredExpenses.length}</div>
          </div>
        </div>

        <div className='w-full px-6'>
          {filteredExpenses.length > 0 ? (
            <>
              <table className='w-full bg-white rounded-md'>
                <thead>
                  <tr className='bg-gray-200'>
                    <th className='p-2'>Title</th>
                    <th className='p-2'>Amount</th>
                    <th className='p-2'>Date</th>
                    <th className='p-2'>Category</th>
                    <th className='p-2'>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((e) => (
                    <tr key={e.id} className='border-t border-gray-300'>
                      <td className='p-2'>{e.name}</td>
                      <td className='p-2'>{e.amount}</td>
                      <td className='p-2'>{e.date}</td>
                      <td className='p-2 capitalize'>{e.category}</td>
                      <td className='p-2 flex gap-2'>
                        <button
                          onClick={() => handleEdit(e)}
                          className='bg-yellow-500 text-white px-2 py-1 rounded'
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(e.id)}
                          className='bg-red-500 text-white px-2 py-1 rounded'
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className='flex justify-between mt-4 bg-white p-3 rounded shadow'>
                <span className='font-bold text-gray-700'>Filtered Total</span>
                <span className='font-bold text-gray-700'> Rs : {filteredTotal}</span>
              </div>
            </>
          ) : (
            <p className='text-center'>No Expenses Found</p>
          )}
        </div>

      </div>

    </div>
  )
}

export default ExpenseTracker