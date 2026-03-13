declare namespace App.Data {
export type ProductData = {
id: number;
name: string;
price: number;
stock: number;
description: string | null;
};
export type ProductPayloadData = {
name: string;
price: number;
stock: number;
description: string | null;
};
}
