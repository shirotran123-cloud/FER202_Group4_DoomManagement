import jsPDF from 'jspdf';

interface ContractData {
  contractId: string;
  studentName: string;
  mssv: string;
  bedCode: string;
  createdAt: string;
}

export const generateContractPDF = (data: ContractData) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("DORMITORY RENTAL CONTRACT", 105, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);

  doc.text(`Contract ID: ${data.contractId}`, 20, 40);
  doc.text(`Date: ${new Date(data.createdAt).toLocaleDateString()}`, 20, 50);

  doc.text("Between:", 20, 70);
  doc.setFont("helvetica", "bold");
  doc.text("FPT University Dormitory Management", 20, 80);
  
  doc.setFont("helvetica", "normal");
  doc.text("And Student:", 20, 100);
  doc.text(`Full Name: ${data.studentName}`, 20, 110);
  doc.text(`Student ID (MSSV): ${data.mssv}`, 20, 120);

  doc.text("Agrees to rent the following bed:", 20, 140);
  doc.setFont("helvetica", "bold");
  doc.text(`Bed Code: ${data.bedCode}`, 20, 150);

  doc.setFont("helvetica", "normal");
  doc.text("By signing this contract, the student agrees to the dormitory's rules", 20, 170);
  doc.text("and regulations. Accommodation fee for the term has been paid in full.", 20, 180);

  doc.text("Management Signature", 40, 220);
  doc.text("Student Signature", 140, 220);

  // Save the PDF
  doc.save(`Contract_${data.mssv}_${data.bedCode}.pdf`);
};
