import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const StudentProfile = ({ rollNo }) => {
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const fetchStudent = async () => {
      const docRef = doc(db, "students", rollNo);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setStudent(docSnap.data());
      } else {
        console.log("Student not found");
      }
    };

    fetchStudent();
  }, [rollNo]);

  if (!student) return <p>Loading...</p>;

  return (
    <div>
      <h2>{student.name}</h2>
      <p>Roll No: {student.rollNo}</p>
      <p>Class: {student.classSection}</p>
      <p>Section: {student.section}</p>
    </div>
  );
};

export default StudentProfile;
