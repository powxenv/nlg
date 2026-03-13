import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { PencilLine, Plus, RefreshCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import {
    destroy,
    store,
    sync,
    update,
} from '@/actions/App/Http/Controllers/ProductController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

type Product = App.Data.ProductData;

type ProductForm = {
    name: string;
    price: string;
    stock: string;
    description: string;
};

const emptyProductForm: ProductForm = {
    name: '',
    price: '',
    stock: '',
    description: '',
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

type DashboardProps = {
    products: PaginatedData<Product>;
};

export default function Dashboard({ products }: DashboardProps) {
    const { flash } = usePage().props;
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProductId, setEditingProductId] = useState<number | null>(
        null,
    );
    const productForm = useForm<ProductForm>(emptyProductForm);
    const syncForm = useForm({});

    const closeDialog = (): void => {
        setIsDialogOpen(false);
        setEditingProductId(null);
        productForm.reset();
        productForm.clearErrors();
    };

    const openCreateDialog = (): void => {
        setEditingProductId(null);
        productForm.reset();
        productForm.clearErrors();
        setIsDialogOpen(true);
    };

    const openEditDialog = (product: Product): void => {
        setEditingProductId(product.id);
        productForm.clearErrors();
        productForm.setData({
            name: product.name,
            price: product.price.toFixed(2),
            stock: String(product.stock),
            description: product.description ?? '',
        });
        setIsDialogOpen(true);
    };

    const submit = (): void => {
        if (editingProductId !== null) {
            productForm.submit(update(editingProductId), {
                preserveScroll: true,
                onSuccess: () => closeDialog(),
            });

            return;
        }

        productForm.submit(store(), {
            preserveScroll: true,
            onSuccess: () => closeDialog(),
        });
    };

    const syncProducts = (): void => {
        syncForm.submit(sync(), {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Product Dashboard" />

            <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
                <div className="flex w-full max-w-4xl flex-col gap-6">
                    <div className="flex flex-col gap-2 text-center">
                        <h1 className="text-2xl font-semibold">
                            Product Dashboard
                        </h1>
                    </div>

                    {flash.success && (
                        <Alert>
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>{flash.success}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                            Showing {products.from ?? 0} to {products.to ?? 0}{' '}
                            of {products.total} products
                        </p>

                        <div className="flex flex-wrap gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={syncProducts}
                                disabled={syncForm.processing}
                            >
                                <RefreshCcw data-icon="inline-start" />
                                {syncForm.processing
                                    ? 'Syncing...'
                                    : 'Sync Products'}
                            </Button>

                            <Button type="button" onClick={openCreateDialog}>
                                <Plus data-icon="inline-start" />
                                Add Product
                            </Button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-lg border bg-background">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.length > 0 ? (
                                    products.data.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>
                                                {currencyFormatter.format(
                                                    product.price,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {product.stock}
                                            </TableCell>
                                            <TableCell className="max-w-sm whitespace-normal text-muted-foreground">
                                                <span className="line-clamp-2">
                                                    {product.description ??
                                                        'No description'}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditDialog(
                                                                product,
                                                            )
                                                        }
                                                    >
                                                        <PencilLine data-icon="inline-start" />
                                                        Edit
                                                    </Button>

                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                type="button"
                                                                variant="destructive"
                                                                size="sm"
                                                            >
                                                                <Trash2 data-icon="inline-start" />
                                                                Delete
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent size="sm">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>
                                                                    Delete
                                                                    product?
                                                                </AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This will
                                                                    remove{' '}
                                                                    {
                                                                        product.name
                                                                    }{' '}
                                                                    from the
                                                                    list.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    Cancel
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    variant="destructive"
                                                                    onClick={() =>
                                                                        router.visit(
                                                                            destroy(
                                                                                product.id,
                                                                            ),
                                                                            {
                                                                                preserveScroll: true,
                                                                                onSuccess:
                                                                                    () => {
                                                                                        if (
                                                                                            editingProductId ===
                                                                                            product.id
                                                                                        ) {
                                                                                            closeDialog();
                                                                                        }
                                                                                    },
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={5}
                                            className="py-12 text-center text-muted-foreground"
                                        >
                                            No products yet.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-sm text-muted-foreground">
                            Page {products.current_page} of {products.last_page}
                        </span>

                        <div className="flex gap-2">
                            <Button
                                asChild={Boolean(products.prev_page_url)}
                                type="button"
                                variant="outline"
                                disabled={!products.prev_page_url}
                            >
                                {products.prev_page_url ? (
                                    <Link
                                        href={products.prev_page_url}
                                        preserveScroll
                                    >
                                        Previous
                                    </Link>
                                ) : (
                                    <span>Previous</span>
                                )}
                            </Button>

                            <Button
                                asChild={Boolean(products.next_page_url)}
                                type="button"
                                variant="outline"
                                disabled={!products.next_page_url}
                            >
                                {products.next_page_url ? (
                                    <Link
                                        href={products.next_page_url}
                                        preserveScroll
                                    >
                                        Next
                                    </Link>
                                ) : (
                                    <span>Next</span>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        closeDialog();
                    }
                }}
            >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProductId !== null
                                ? 'Edit Product'
                                : 'Add Product'}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the product details below.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        className="flex flex-col gap-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                    >
                        <FieldGroup>
                            <Field
                                data-invalid={Boolean(productForm.errors.name)}
                            >
                                <FieldLabel htmlFor="name">Name</FieldLabel>
                                <Input
                                    id="name"
                                    value={productForm.data.name}
                                    onChange={(event) =>
                                        productForm.setData(
                                            'name',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        productForm.errors.name,
                                    )}
                                />
                                <FieldError>
                                    {productForm.errors.name}
                                </FieldError>
                            </Field>

                            <Field
                                data-invalid={Boolean(productForm.errors.price)}
                            >
                                <FieldLabel htmlFor="price">Price</FieldLabel>
                                <Input
                                    id="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={productForm.data.price}
                                    onChange={(event) =>
                                        productForm.setData(
                                            'price',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        productForm.errors.price,
                                    )}
                                />
                                <FieldError>
                                    {productForm.errors.price}
                                </FieldError>
                            </Field>

                            <Field
                                data-invalid={Boolean(productForm.errors.stock)}
                            >
                                <FieldLabel htmlFor="stock">Stock</FieldLabel>
                                <Input
                                    id="stock"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={productForm.data.stock}
                                    onChange={(event) =>
                                        productForm.setData(
                                            'stock',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        productForm.errors.stock,
                                    )}
                                />
                                <FieldError>
                                    {productForm.errors.stock}
                                </FieldError>
                            </Field>

                            <Field
                                data-invalid={Boolean(
                                    productForm.errors.description,
                                )}
                            >
                                <FieldLabel htmlFor="description">
                                    Description
                                </FieldLabel>
                                <Textarea
                                    id="description"
                                    rows={4}
                                    value={productForm.data.description}
                                    onChange={(event) =>
                                        productForm.setData(
                                            'description',
                                            event.target.value,
                                        )
                                    }
                                    aria-invalid={Boolean(
                                        productForm.errors.description,
                                    )}
                                />
                                <FieldError>
                                    {productForm.errors.description}
                                </FieldError>
                            </Field>
                        </FieldGroup>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={productForm.processing}
                            >
                                {editingProductId !== null
                                    ? 'Update Product'
                                    : 'Create Product'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
