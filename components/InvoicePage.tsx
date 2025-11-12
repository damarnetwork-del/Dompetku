import React, { useState } from 'react';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import DownloadIcon from './icons/DownloadIcon';
import WhatsappIcon from './icons/WhatsappIcon';

declare const jspdf: any;

interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    logo: string | null;
}

interface InvoicePageProps {
  onBack: () => void;
  companyInfo: CompanyInfo;
}

interface InvoiceItem {
    id: number;
    description: string;
    qty: number;
    price: number;
}

const InvoicePage: React.FC<InvoicePageProps> = ({ onBack, companyInfo }) => {
    const [recipient, setRecipient] = useState('');
    const [recipientPhone, setRecipientPhone] = useState('');
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: 1, description: '', qty: 1, price: 0 }
    ]);
    
    const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        const newItems = [...items];
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        (newItems[index] as any)[field] = isNaN(numericValue) ? 0 : numericValue;
        setItems(newItems);
    };
    
    const addItem = () => {
        setItems([...items, { id: Date.now(), description: '', qty: 1, price: 0 }]);
    };
    
    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };
    
    const calculateGrandTotal = () => {
        return items.reduce((total, item) => total + (item.qty * item.price), 0);
    };

    const handleSendWhatsApp = () => {
        let formattedPhone = recipientPhone.trim();
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.substring(1);
        }
        formattedPhone = formattedPhone.replace(/\D/g, '');

        const grandTotal = calculateGrandTotal();

        const message = encodeURIComponent(
`*Invoice Pemberitahuan*

Yth. Bpk/Ibu ${recipient},

Dengan hormat, kami sampaikan rincian tagihan Anda sebagai berikut:

*Total Tagihan: Rp ${grandTotal.toLocaleString('id-ID')}*

Invoice resmi dalam format PDF juga telah kami siapkan. Mohon konfirmasi jika Anda memerlukan salinan PDF untuk pencatatan Anda.

Terima kasih atas perhatian dan kerjasamanya.

Hormat kami,
*${companyInfo.name}*`
        );

        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDownloadPDF = () => {
        const { jsPDF } = jspdf;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        if (companyInfo.logo) {
            try {
                doc.addImage(companyInfo.logo, 'PNG', 15, 15, 25, 25);
            } catch(e) { console.error("Error adding logo:", e); }
        }
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(companyInfo.name, 45, 22);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(companyInfo.address, 45, 28);
        doc.text(`Telp: ${companyInfo.phone}`, 45, 33);

        // Invoice Title
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('INVOICE', pageWidth - 15, 25, { align: 'right' });
        
        doc.setLineWidth(0.5);
        doc.line(15, 40, pageWidth - 15, 40);

        // Invoice Details
        const invoiceNumber = `INV-${Date.now()}`;
        const today = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Kepada Yth:', 15, 50);
        doc.setFont('helvetica', 'normal');
        doc.text(recipient || 'N/A', 15, 55);

        doc.setFont('helvetica', 'bold');
        doc.text('No. Invoice:', pageWidth - 60, 50);
        doc.setFont('helvetica', 'normal');
        doc.text(invoiceNumber, pageWidth - 15, 50, { align: 'right' });

        doc.setFont('helvetica', 'bold');
        doc.text('Tanggal:', pageWidth - 60, 55);
        doc.setFont('helvetica', 'normal');
        doc.text(today, pageWidth - 15, 55, { align: 'right' });

        // Invoice Table
        const tableData = items.map(item => [
            item.description,
            item.qty.toString(),
            item.price.toLocaleString('id-ID'),
            (item.qty * item.price).toLocaleString('id-ID')
        ]);

        (doc as any).autoTable({
            head: [['Deskripsi', 'Qty', 'Harga (Rp)', 'Total (Rp)']],
            body: tableData,
            startY: 65,
            headStyles: { fillColor: [31, 41, 55] },
            theme: 'grid',
            didDrawCell: (data: any) => {
                if (data.section === 'body' && data.column.index >= 2) {
                    data.cell.styles.halign = 'right';
                }
            }
        });

        // Grand Total
        const finalY = (doc as any).lastAutoTable.finalY;
        const grandTotal = calculateGrandTotal();
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Grand Total (Rp)', pageWidth - 70, finalY + 10);
        doc.text(grandTotal.toLocaleString('id-ID'), pageWidth - 15, finalY + 10, { align: 'right' });

        // Footer / Notes
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text('Terima kasih atas bisnis Anda.', 15, doc.internal.pageSize.getHeight() - 10);
        
        doc.save(`invoice-${invoiceNumber}.pdf`);
    };

    return (
        <div className="flex-grow flex flex-col">
            <div className="mb-8">
                <button
                onClick={onBack}
                className="flex items-center gap-2 text-lg text-white font-medium hover:text-sky-300 transition-colors duration-300"
                aria-label="Kembali ke dasbor"
                >
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Kembali</span>
                </button>
            </div>
            
            <main className="flex-grow flex flex-col bg-black/20 rounded-lg p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-3xl font-semibold">Buat Invoice Baru</h2>
                    <div className="flex flex-wrap justify-end gap-2">
                        <button
                            onClick={handleDownloadPDF}
                            disabled={!recipient || items.length === 0 || calculateGrandTotal() <= 0}
                            className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-green-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                            aria-label="Unduh Invoice sebagai PDF"
                        >
                            <DownloadIcon className="w-5 h-5"/>
                            <span>Unduh PDF</span>
                        </button>
                        <button
                            onClick={handleSendWhatsApp}
                            disabled={!recipient || !recipientPhone || items.length === 0 || calculateGrandTotal() <= 0}
                            className="flex items-center gap-2 py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-teal-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                            aria-label="Kirim Invoice via WhatsApp"
                        >
                            <WhatsappIcon className="w-5 h-5"/>
                            <span>Kirim WhatsApp</span>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Recipient */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recipient" className="block text-sm font-medium text-gray-300 mb-1">Kepada</label>
                            <input
                                type="text"
                                id="recipient"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                className="w-full input-style"
                                placeholder="Nama pelanggan atau perusahaan"
                            />
                        </div>
                        <div>
                            <label htmlFor="recipientPhone" className="block text-sm font-medium text-gray-300 mb-1">No. WhatsApp</label>
                            <input
                                type="tel"
                                id="recipientPhone"
                                value={recipientPhone}
                                onChange={(e) => setRecipientPhone(e.target.value)}
                                className="w-full input-style"
                                placeholder="Nomor WhatsApp penerima"
                            />
                        </div>
                    </div>


                    {/* Items Header */}
                    <div className="hidden md:grid grid-cols-12 gap-4 items-center px-2 py-1 text-xs text-white uppercase">
                        <div className="col-span-6">Deskripsi</div>
                        <div className="col-span-2 text-right">Qty</div>
                        <div className="col-span-2 text-right">Harga (Rp)</div>
                        <div className="col-span-2 text-right">Total (Rp)</div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-center bg-white/5 p-3 rounded-lg">
                                <div className="col-span-12 md:col-span-6">
                                    <label className="block text-xs font-medium text-gray-400 mb-1 md:hidden">Deskripsi</label>
                                    <input type="text" value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Deskripsi item/layanan" className="w-full input-style"/>
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                     <label className="block text-xs font-medium text-gray-400 mb-1 md:hidden">Qty</label>
                                    <input type="number" value={item.qty} onChange={e => handleItemChange(index, 'qty', e.target.value)} placeholder="1" className="w-full input-style text-right"/>
                                </div>
                                <div className="col-span-8 md:col-span-2">
                                     <label className="block text-xs font-medium text-gray-400 mb-1 md:hidden">Harga</label>
                                    <input type="number" value={item.price} onChange={e => handleItemChange(index, 'price', e.target.value)} placeholder="0" className="w-full input-style text-right"/>
                                </div>
                                <div className="col-span-10 md:col-span-1 flex items-center justify-end font-semibold">
                                    <span className="md:hidden text-xs text-gray-400 mr-2">Total:</span> Rp {(item.qty * item.price).toLocaleString('id-ID')}
                                </div>
                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-300 transition-colors font-bold">&times;</button>
                                </div>
                            </div>
                        ))}
                    </div>

                     {/* Add Item Button & Grand Total */}
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
                        <button onClick={addItem} className="py-2 px-4 border border-sky-500 rounded-lg text-sm font-medium text-sky-300 hover:bg-sky-500/20 focus:outline-none transition-colors">
                            + Tambah Baris
                        </button>
                        <div className="text-right">
                            <p className="text-gray-400 font-medium">Grand Total</p>
                            <p className="text-2xl font-bold text-white">Rp {calculateGrandTotal().toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                </div>
            </main>
            <style>{`
                .input-style {
                    background-color: rgba(255, 255, 255, 0.1);
                    border: 1px solid #4b5563;
                    border-radius: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    color: white;
                    width: 100%;
                }
                .input-style:focus {
                    outline: none;
                    box-shadow: 0 0 0 2px #60a5fa;
                    border-color: #60a5fa;
                }
                input[type=number]::-webkit-inner-spin-button, 
                input[type=number]::-webkit-outer-spin-button { 
                  -webkit-appearance: none; 
                  margin: 0; 
                }
                input[type=number] {
                  -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
};

export default InvoicePage;