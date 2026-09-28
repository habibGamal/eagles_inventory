import VoucherForm, {
    type EmployeeOption,
    type ItemOption,
    type SectorOption,
    type UserOption,
    type WarehouseOption,
} from './voucher-form';

interface CreateProps {
    warehouseOptions: WarehouseOption[];
    sectorOptions: SectorOption[];
    employeeOptions: EmployeeOption[];
    userOptions: UserOption[];
    itemOptions: ItemOption[];
}

export default function DispatchVoucherCreate({
    warehouseOptions,
    sectorOptions,
    employeeOptions,
    userOptions,
    itemOptions,
}: CreateProps) {
    return (
        <VoucherForm
            mode="create"
            warehouseOptions={warehouseOptions}
            sectorOptions={sectorOptions}
            employeeOptions={employeeOptions}
            userOptions={userOptions}
            itemOptions={itemOptions}
        />
    );
}
