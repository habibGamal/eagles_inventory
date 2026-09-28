import InvoiceForm, {
    type InvoiceFormInitialData,
    type ItemOption,
    type SupplierOption,
    type WarehouseOption,
} from './invoice-form';

interface EditProps {
    invoice: InvoiceFormInitialData;
    supplierOptions: SupplierOption[];
    warehouseOptions: WarehouseOption[];
    itemOptions: ItemOption[];
}

export default function PurchaseInvoiceEdit({
    invoice,
    supplierOptions,
    warehouseOptions,
    itemOptions,
}: EditProps) {
    return (
        <InvoiceForm
            mode="edit"
            initialData={invoice}
            supplierOptions={supplierOptions}
            warehouseOptions={warehouseOptions}
            itemOptions={itemOptions}
        />
    );
}
