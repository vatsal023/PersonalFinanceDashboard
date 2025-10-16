// import { useState } from "react";
// import axios from "axios";

// const AddBullionModal = ({ setRefresh }) => {
//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState({
//     name: "",
//     date: "",
//     quantity: "",
//     purity: "",
//     rate: "",
//   });

//   const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async () => {
//     try {
//       const newBullion = {
//         ...form,
//         quantity: Number(form.quantity),
//         rate: Number(form.rate),
//         purity: Number(form.purity),
//         amountInvested: Number(form.quantity) * Number(form.rate) * (form.purity / 24),
//         status: "active",
//       };
//       await axios.post("/api/bullions", newBullion);
//       setRefresh((prev) => !prev);
//       setShowModal(false);
//       setForm({ name: "", date: "", quantity: "", purity: "", rate: "" });
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add bullion.");
//     }
//   };

//   return (
//     <>
//       <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
//         Add Bullion
//       </button>

//       {showModal && (
//         <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
//           <div className="bg-white p-6 rounded-xl shadow-lg w-[400px]" onClick={(e) => e.stopPropagation()}>
//             <h2 className="text-lg font-semibold mb-4">Add Bullion</h2>
//             {["name", "date", "quantity", "purity", "rate"].map((field) => (
//               <div className="mb-2" key={field}>
//                 <label className="block mb-1">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
//                 <input
//                   type={field === "date" ? "date" : "number"}
//                   name={field}
//                   value={form[field]}
//                   onChange={handleChange}
//                   className="border p-1 w-full rounded"
//                 />
//               </div>
//             ))}
//             <div className="flex justify-end gap-2 mt-4">
//               <button onClick={() => setShowModal(false)} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
//                 Cancel
//               </button>
//               <button onClick={handleSubmit} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
//                 Add
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AddBullionModal;


import { useState } from "react";
import axios from "axios";

const AddBullionModal = ({ setRefresh }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    date: "",
    quantity: "",
    purity: "",
    rate: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const investment = {
        date: new Date(form.date),
        quantity: Number(form.quantity),
        purity: Number(form.purity),
        rate: Number(form.rate),
        amountInvested: Number(form.quantity) * Number(form.rate) * (Number(form.purity)/24),
      };

      // Check if bullion already exists
      const res = await axios.get("/api/bullions");

      console.log("res.data:", res.data);

        const existingBullion = res.data.find(
              (b) => b.name.toLowerCase() === form.name.toLowerCase()
              && b.investments[0].purity  === Number(form.purity)  // check purity
            );

            ///this also works
//       const existingBullion = res.data.find((b) => {
//         console.log(b.investments[0].purity);
//   return (b.name.toLowerCase() === form.name.toLowerCase() && b.investments[0].purity === Number(form.purity));
// });
   
      console.log("existingBullion:", existingBullion);
      if (existingBullion) {
        // Merge investments
          console.log("Merging investment");
        existingBullion.investments.push(investment);
        await axios.put(`/api/bullions/${existingBullion._id}`, { investments: existingBullion.investments });
      } else {
        // Create new bullion
        console.log("Creating new bullion");
        await axios.post("/api/bullions", {
          name: form.name,
          investments: [investment],
          status: "active",
        });
      }

      setRefresh((prev) => !prev);
      setIsOpen(false);
      setForm({ name: "", date: "", quantity: "", purity: "", rate: "" });
    } catch (error) {
      console.error("Error adding bullion:", error);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Add Bullion
      </button>

      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-xl w-96">
            <h3 className="text-xl font-semibold mb-4">Add Bullion</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                name="name"
                placeholder="Bullion Name"
                value={form.name}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="number"
                name="quantity"
                placeholder="Quantity (grams)"
                value={form.quantity}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="number"
                name="purity"
                placeholder="Purity (24 = pure gold)"
                value={form.purity}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <input
                type="number"
                name="rate"
                placeholder="Rate per gram (INR)"
                value={form.rate}
                onChange={handleChange}
                className="border p-2 w-full rounded"
                required
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1 border rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddBullionModal;
