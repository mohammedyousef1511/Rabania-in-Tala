import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { toast } from "sonner";
import { Id } from "../convex/_generated/dataModel";

export function AdminDashboard() {
  const tasks = useQuery(api.tasks.listTasks) || [];
  const addTask = useMutation(api.tasks.addTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  
  const [newTask, setNewTask] = useState({
    title: "",
    score: 0,
    type: "checkbox" as "checkbox" | "numeric"
  });
  
  const [reportDates, setReportDates] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  
  const report = useQuery(api.admin.getReport, reportDates);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTask(newTask);
      setNewTask({ title: "", score: 0, type: "checkbox" });
      toast.success("تمت إضافة المهمة بنجاح");
    } catch (err) {
      toast.error("حدث خطأ أثناء إضافة المهمة");
    }
  };

  const handleDeleteTask = async (taskId: Id<"tasks">) => {
    try {
      await deleteTask({ taskId });
      toast.success("تم حذف المهمة بنجاح");
    } catch (err) {
      toast.error("حدث خطأ أثناء حذف المهمة");
    }
  };

  const downloadReport = () => {
    if (!report) return;
    
    const rows = report.completions.map(completion => {
      const user = report.users.find(u => u._id === completion.userId);
      const task = report.tasks.find(t => t._id === completion.taskId);
      return [
        completion.date,
        user?.email,
        task?.title,
        completion.completed ? "نعم" : "لا",
        completion.numericValue || "",
        completion.score
      ].join(",");
    });

    const csv = ["التاريخ,المستخدم,المهمة,مكتملة,القيمة,النقاط", ...rows].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `تقرير_${reportDates.startDate}_${reportDates.endDate}.csv`;
    link.click();
  };

  return (
    <div className="space-y-8">
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-semibold mb-4">إضافة مهمة جديدة</h3>
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block mb-2">عنوان المهمة</label>
            <input
              type="text"
              value={newTask.title}
              onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">النقاط</label>
            <input
              type="number"
              value={newTask.score}
              onChange={e => setNewTask(prev => ({ ...prev, score: Number(e.target.value) }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">نوع المهمة</label>
            <select
              value={newTask.type}
              onChange={e => setNewTask(prev => ({ ...prev, type: e.target.value as "checkbox" | "numeric" }))}
              className="w-full p-2 border rounded"
            >
              <option value="checkbox">اختيار نعم/لا</option>
              <option value="numeric">إدخال رقمي</option>
            </select>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            إضافة المهمة
          </button>
        </form>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-semibold mb-4">المهام الحالية</h3>
        <div className="space-y-4">
          {tasks.map(task => (
            <div key={task._id} className="flex items-center justify-between p-4 border rounded">
              <div>
                <h4 className="font-semibold">{task.title}</h4>
                <p className="text-sm text-gray-600">
                  النقاط: {task.score} | النوع: {task.type === "checkbox" ? "اختيار" : "رقمي"}
                </p>
              </div>
              <button
                onClick={() => handleDeleteTask(task._id)}
                className="text-red-600 hover:text-red-800"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-2xl font-semibold mb-4">التقارير</h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div>
              <label className="block mb-2">من تاريخ</label>
              <input
                type="date"
                value={reportDates.startDate}
                onChange={e => setReportDates(prev => ({ ...prev, startDate: e.target.value }))}
                className="p-2 border rounded"
              />
            </div>
            <div>
              <label className="block mb-2">إلى تاريخ</label>
              <input
                type="date"
                value={reportDates.endDate}
                onChange={e => setReportDates(prev => ({ ...prev, endDate: e.target.value }))}
                className="p-2 border rounded"
              />
            </div>
          </div>
          <button
            onClick={downloadReport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={!report}
          >
            تحميل التقرير
          </button>
        </div>
      </section>
    </div>
  );
}
