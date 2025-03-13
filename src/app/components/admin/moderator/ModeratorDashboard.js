import React, { useState, useEffect } from "react";
import { useAuth } from "../../core/context/AuthContext";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import {
  ShieldCheckIcon,
  FlagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const ReportsList = ({ reports, onResolve }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      <FlagIcon className="h-6 w-6 mr-2 text-red-500" />
      Raporlar
    </h2>
    {reports.length === 0 ? (
      <p className="text-gray-500">Aktif rapor bulunmuyor.</p>
    ) : (
      <ul className="space-y-4">
        {reports.map((report) => (
          <li key={report.id} className="border-b pb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{report.reason}</p>
                <p className="text-sm text-gray-500">{report.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onResolve(report.id, "resolved")}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                >
                  Çöz
                </button>
                <button
                  onClick={() => onResolve(report.id, "rejected")}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Reddet
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const UserManagementPanel = () => (
  <div className="bg-white shadow rounded-lg p-6">
    <h2 className="text-xl font-semibold mb-4 flex items-center">
      <UserGroupIcon className="h-6 w-6 mr-2 text-blue-500" />
      Kullanıcı Yönetimi
    </h2>
    <p className="text-gray-500">
      Kullanıcı yönetim özellikleri henüz eklenmedi.
    </p>
  </div>
);

const ModeratorDashboard = () => {
  const { currentUser } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const reportsQuery = query(
          collection(db, "reports"),
          where("status", "==", "pending")
        );
        const snapshot = await getDocs(reportsQuery);
        setReports(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error("Raporları getirirken hata oluştu:", error);
      }
    };

    fetchReports();
  }, []);

  const handleReportAction = async (reportId, action) => {
    try {
      await updateDoc(doc(db, "reports", reportId), {
        status: action,
        resolvedAt: serverTimestamp(),
      });
      // Raporu listeden kaldır
      setReports(reports.filter((report) => report.id !== reportId));
    } catch (error) {
      console.error("Rapor işlenirken hata oluştu:", error);
    }
  };

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">
          Moderatör paneline erişmek için giriş yapmalısınız.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <ShieldCheckIcon className="h-8 w-8 mr-3 text-blue-600" />
        <h1 className="text-2xl font-bold">Moderatör Kontrol Paneli</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportsList reports={reports} onResolve={handleReportAction} />
        <UserManagementPanel />
      </div>
    </div>
  );
};

export default ModeratorDashboard;
