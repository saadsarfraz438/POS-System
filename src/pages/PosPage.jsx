import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, Search } from 'lucide-react';
import Swal from 'sweetalert2';
import SectionCard from '../components/SectionCard.jsx';
import { getProducts, getSalespersons, createSale } from '../services/api.js';

const getTodayDateValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const today = getTodayDateValue();

const getSettings = () => {
  if (typeof window === 'undefined') return { taxRate: 0, printEnabled: true, discountEnabled: true, darkMode: false };
  try {
    return { taxRate: 0, printEnabled: true, discountEnabled: true, darkMode: false, ...JSON.parse(window.localStorage.getItem('lumensoft-settings') || '{}') };
  } catch {
    return { taxRate: 0, printEnabled: true, discountEnabled: true, darkMode: false };
  }
};

const addNotification = (message) => {
  if (typeof window === 'undefined') return;
  const stored = JSON.parse(window.localStorage.getItem('lumensoft-notifications') || '[]');
  const next = [{ id: Date.now(), message, createdAt: new Date().toISOString() }, ...stored].slice(0, 8);
  window.localStorage.setItem('lumensoft-notifications', JSON.stringify(next));
  window.dispatchEvent(new Event('lumensoft:notifications'));
};

export default function PosPage() {
  const [products, setProducts] = useState([]);
  const [salespersons, setSalespersons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSalesperson, setSelectedSalesperson] = useState('');
  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-5)}`);
  const [saleDate, setSaleDate] = useState(today);
  const [selectedItems, setSelectedItems] = useState([]);
  const [settings, setSettings] = useState(getSettings);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, salespersonsRes] = await Promise.all([getProducts(), getSalespersons()]);
        setProducts(productsRes.data || []);
        setSalespersons(salespersonsRes.data || []);
      } catch (error) {
        console.error(error);
      }
    };
    load();
    const syncSettings = () => setSettings(getSettings());
    window.addEventListener('storage', syncSettings);
    window.addEventListener('lumensoft:settings', syncSettings);
    return () => {
      window.removeEventListener('storage', syncSettings);
      window.removeEventListener('lumensoft:settings', syncSettings);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products.slice(0, 8);
    return products.filter((product) => `${product.code} ${product.name}`.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 8);
  }, [products, searchTerm]);

  const addItem = (product) => {
    const existing = selectedItems.find((item) => item.id === product.id);
    if (existing) {
      setSelectedItems((current) => current.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setSelectedItems((current) => [...current, { id: product.id, name: product.name, retailPrice: Number(product.retailPrice || 0), qty: 1, discount: 0 }]);
    }
    setSearchTerm('');
  };

  const updateItem = (id, field, value) => {
    if (field === 'qty') {
      const numericValue = Number(value);
      if (numericValue <= 0) {
        removeItem(id);
        return;
      }
    }

    setSelectedItems((current) => current.flatMap((item) => {
      if (item.id !== id) return [item];
      if (field === 'qty') {
        return [{ ...item, qty: Number(value) }];
      }
      if (field === 'discount') {
        const maxAllowed = item.retailPrice * item.qty;
        const numericValue = Math.max(0, Math.min(Number(value || 0), maxAllowed));
        return [{ ...item, discount: numericValue }];
      }
      return [{ ...item, [field]: Number(value) }];
    }));
  };

  const removeItem = (id) => {
    setSelectedItems((current) => current.filter((item) => item.id !== id));
  };

  const subtotal = selectedItems.reduce((sum, item) => sum + item.retailPrice * item.qty, 0);
  const discount = selectedItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  const taxRate = Number(settings.taxRate || 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount - discount;
  const discountEnabled = settings.discountEnabled !== false;

  const saveSale = async () => {
    if (!selectedSalesperson || selectedItems.length === 0) {
      Swal.fire('Validation', 'Choose a salesperson and add at least one product.', 'warning');
      return;
    }

    const invalidQty = selectedItems.some((item) => Number(item.qty) <= 0);
    if (invalidQty) {
      Swal.fire('Validation', 'Each product quantity must be greater than zero.', 'warning');
      return;
    }

    const invalidDiscounts = selectedItems.some((item) => Number(item.discount || 0) < 0 || Number(item.discount || 0) > item.retailPrice * item.qty);
    if (invalidDiscounts) {
      Swal.fire('Validation', 'Discounts must be zero or more and cannot exceed the line total.', 'warning');
      return;
    }

    const effectiveSaleDate = getTodayDateValue();
    if (saleDate !== effectiveSaleDate) {
      setSaleDate(effectiveSaleDate);
    }

    const salespersonName = salespersons.find((item) => String(item.id) === String(selectedSalesperson))?.name || '';
    const payload = {
      invoiceNo: invoiceNo.trim(),
      saleDate: effectiveSaleDate,
      salespersonId: Number(selectedSalesperson),
      salespersonName,
      grandTotal,
      items: selectedItems.map((item) => ({ productId: item.id, productName: item.name, quantity: item.qty, price: item.retailPrice, discount: item.discount, total: item.retailPrice * item.qty - item.discount })),
    };

    try {
      await createSale(payload);
      addNotification(`${salespersonName || 'Salesperson'} completed invoice ${payload.invoiceNo}`);
      Swal.fire('Saved', 'Sale recorded successfully.', 'success');
      setSelectedItems([]);
      setSelectedSalesperson('');
      setInvoiceNo(`INV-${Date.now().toString().slice(-5)}`);
      setSaleDate(today);
    } catch (error) {
      const message = error?.response?.data?.message || 'Something went wrong.';
      Swal.fire('Error', message, 'error');
    }
  };

  const handlePrintReceipt = () => {
    const salespersonName = salespersons.find((item) => String(item.id) === String(selectedSalesperson))?.name || 'N/A';
    const receiptDateTime = new Date().toLocaleString();
    const receipt = [
      'Lumensoft POS ',
      'Customer Receipt',
      '  ',
      `Invoice: ${invoiceNo}`,
      `Salesperson: ${salespersonName}`,
      `Date: ${receiptDateTime}`,
      ' ',
      '------------------------------',
      ' ',
      'Description(B)  Qty  price(Rs)',
      ' ',
      ...selectedItems.map((item) => `${item.name} x${item.qty} = Rs ${Number(item.retailPrice * item.qty - (item.discount || 0)).toLocaleString()}`),
      '   ',
      '------------------------------',
      `Subtotal: Rs ${subtotal.toLocaleString()}`,
      `Tax (${taxRate}%): Rs ${taxAmount.toLocaleString()}`,
      `Discount: Rs ${discount.toLocaleString()}`,
      `Grand Total: Rs ${grandTotal.toLocaleString()}`,
      ' ',
      '********   *********  *********',
      ' ',
      '** THANK YOU ** ',
      '** LUMENSOFT pos **',
    ].join('\n');

    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoiceNo || 'receipt'}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);

    if (settings.printEnabled !== false) {
      const printWindow = window.open('', '_blank', 'width=600,height=800');
      if (printWindow) {
        printWindow.document.write(`<pre>${receipt.replace(/</g, '&lt;')}</pre>`);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }
    }
  };

  return (
    <div>
      <SectionCard className="mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3">
            <label className="form-label">Salesperson</label>
            <select className="form-select" value={selectedSalesperson} onChange={(e) => setSelectedSalesperson(e.target.value)}>
              <option value="">Choose salesperson</option>
              {salespersons.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Sale Date</label>
            <input className="form-control" type="date" value={saleDate} min={today} max={today} onChange={(e) => setSaleDate(e.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Invoice No</label>
            <input className="form-control" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Search Product</label>
            <div className="input-group">
              <span className="input-group-text"><Search size={16} /></span>
              <input className="form-control" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Start typing..." />
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <SectionCard title="Product Search">
            <div className="row g-3">
              {filteredProducts.map((product) => (
                <div className="col-12 col-md-6 col-lg-4" key={product.id}>
                  <div className="border rounded-4 p-3 h-100 hover-card">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold">{product.name}</div>
                        <small className="text-muted">{product.code}</small>
                      </div>
                      <span className="badge bg-primary">Rs {Number(product.retailPrice || 0).toLocaleString()}</span>
                    </div>
                    <div className="mt-3 d-flex justify-content-between align-items-center">
                      <small className="text-muted">Stock available</small>
                      <button className="btn btn-outline-primary btn-sm" onClick={() => addItem(product)}><Plus size={14} /> Add</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="col-12 col-xl-4">
          <SectionCard title="Sale Items">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Retail</th>
                    {discountEnabled ? <th>Discount</th> : null}
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {selectedItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td><input type="number" min="1" className="form-control form-control-sm" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', e.target.value)} /></td>
                      <td>{item.retailPrice}</td>
                      {discountEnabled ? (
                        <td>
                          <input type="number" min="0" className="form-control form-control-sm" value={item.discount || 0} onChange={(e) => updateItem(item.id, 'discount', e.target.value)} />
                        </td>
                      ) : null}
                      <td>{(item.retailPrice * item.qty - (item.discount || 0)).toLocaleString()}</td>
                      <td><button className="btn btn-outline-danger btn-sm" onClick={() => removeItem(item.id)}><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-top pt-3 mt-3">
              <div className="d-flex justify-content-between"><span>Sub Total</span><b>Rs {subtotal.toLocaleString()}</b></div>
              <div className="d-flex justify-content-between"><span>Tax</span><b>Rs {taxAmount.toLocaleString()}</b></div>
              <div className="d-flex justify-content-between"><span>Discount</span><b>Rs {discount.toLocaleString()}</b></div>
              <div className="d-flex justify-content-between mt-2 fs-5"><span>Grand Total</span><b>Rs {grandTotal.toLocaleString()}</b></div>
            </div>
            <div className="d-flex gap-2 mt-4">
              <button className="btn btn-primary" onClick={saveSale}>Save Sale</button>
              <button className="btn btn-outline-secondary" onClick={() => setSelectedItems([])}>Clear</button>
              <button className="btn btn-outline-info" onClick={handlePrintReceipt} disabled={selectedItems.length === 0}>Print</button>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}