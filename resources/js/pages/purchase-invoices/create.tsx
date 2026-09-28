import InvoiceForm, {
    type ItemOption,
    type SupplierOption,
    type WarehouseOption,
} from './invoice-form';

interface CreateProps {
    supplierOptions: SupplierOption[];
    warehouseOptions: WarehouseOption[];
    itemOptions: ItemOption[];
}

export default function PurchaseInvoiceCreate({
    supplierOptions,
    warehouseOptions,
    itemOptions,
}: CreateProps) {
    return (
        <InvoiceForm
            mode="create"
            supplierOptions={supplierOptions}
            warehouseOptions={warehouseOptions}
            itemOptions={itemOptions}
        />
    );
}
