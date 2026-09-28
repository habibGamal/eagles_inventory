import VoucherForm, {
    type EmployeeOption,
    type ItemOption,
    type SectorOption,
    type UserOption,
    type VoucherFormInitialData,
    type WarehouseOption,
} from './voucher-form';

interface EditProps {
    voucher: VoucherFormInitialData;
    warehouseOptions: WarehouseOption[];
    sectorOptions: SectorOption[];
    employeeOptions: EmployeeOption[];
    userOptions: UserOption[];
    itemOptions: ItemOption[];
}

export default function DispatchVoucherEdit({
    voucher,
    warehouseOptions,
    sectorOptions,
    employeeOptions,
    userOptions,
    itemOptions,
}: EditProps) {
    return (
        <VoucherForm
            mode="edit"
            initialData={voucher}
            warehouseOptions={warehouseOptions}
            sectorOptions={sectorOptions}
            employeeOptions={employeeOptions}
            userOptions={userOptions}
            itemOptions={itemOptions}
        />
    );
}
