'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "@/components/ui/switch"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useFieldArray } from 'react-hook-form';
import * as z from "zod";
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input";
import { Product } from "@/types";
import { createItem, updateItem } from "@/lib/actions/product.actions"
import { useToast } from "@/components/ui/use-toast"
import CancelButton from "../layout/cancel-button";
import React, { useEffect } from 'react';
import { format } from "date-fns"
import { cn , generateSKU } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "@radix-ui/react-icons"
import { Plus , Minus } from "lucide-react"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
  import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
    } from "@/components/ui/select"
    
  import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from "@/components/ui/popover"
import DiscountSelector from "../layout/discount-selector";

//Image validation
const MAX_MB = 5; // Max size in MB
const MAX_UPLOAD_SIZE = MAX_MB * 1024 * 1024; // Convert MB to bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];


const DiscountSchema = z.object({
    $id: z.string(),
    name: z.string(),
    code: z.string().optional(),
    type: z.string(),
    value: z.number(),
    redemptionStartDate: z.date().optional(),
    redemptionEndDate: z.date().optional(),
    redemptionLimit: z.number().optional(),
    description: z.string().optional(),
    status: z.boolean()
  });

    const formSchema = z.object({
        name: z.string({
            required_error: "Product name is required",
            invalid_type_error: "Product name must be more than 2 characters long",
        }).min(2),
        slug: z.string(),
        sku: z.string(),
        price: z.number(),
        category: z.any(),
        unit: z.any(),
        //discount: z.lazy(() => DiscountSchema).optional(),
        discount: z.any(),
        minimumSellingPrice: z.number().optional(),
        description: z.preprocess((val) => val === null ? "" : val, z.string().optional()),
        allowDiscount: z.boolean(),
        quantityAlert: z.number().optional(),
        image: z.instanceof(File)
        .optional()
        .refine(
            (file) => !file || file.size !== 0 || file.size <= MAX_UPLOAD_SIZE,
            `Max image size is ${MAX_MB}MB`
        )
        .refine(
            (file) => !file || file.type === "" || ACCEPTED_IMAGE_TYPES.includes(file.type),
            "Only .jpg .jpeg and .png formats are supported"
        ),
       
        status: z.boolean(),
        variants: z.array(z.object({
            variantName: z.string(),
            variantImage: z.any(),
            variantStatus: z.string()
        })),
        quantity: z.number(),
    });

  
    const ProductForm = ({ item }: { item?: Product | null }) => {
        const router = useRouter();
        const [isLoading, setIsLoading] = useState(false)
        const { toast } = useToast()
        const [inputs, setInputs] = useState([{ id: 1 }]);

        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: item ? item : {
                status: false,
                quantity: 0,
                variants: [{ variantName: '', variantImage: null, variantStatus: '' }]
            },
        });

        const { control } = form;
        const { fields, append, remove } = useFieldArray({
            control,
            name: 'variants'
        });

        const onInvalid = (errors : any ) => {
            toast({
                variant: "warning",
                title: "Uh oh! Something went wrong.", 
                description: "Please complete filling the form before you submit"
            });
        }
        
        // Generate SKU and Slug
        const nameValue = form.watch('name');
        useEffect(() => {
            if (nameValue) {
                const generatedSKU = generateSKU(nameValue);
                form.setValue('sku', generatedSKU);

                const generatedSlug = nameValue.toLowerCase().replace(/\s+/g, '-');
                form.setValue('slug', generatedSlug);
            }
        }, [nameValue, form.setValue]);

        const onSubmit = async (data: z.infer<typeof formSchema>) => {
            setIsLoading(true);
        
            try {
                if (item) {
                    await updateItem(item.$id, data);
                    toast({
                        variant: "default",
                        title: "Success", 
                        description: "Product updated succesfully!"
                    });
                } else {
                    await createItem(data);
                    toast({
                        variant: "default",
                        title: "Success", 
                        description: "Product created succesfully!"
                    });
                }
                
                // Redirect to the list page after submission
                router.push("/products");
                router.refresh();
                setIsLoading(false);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Uh oh! Something went wrong.", 
                    description: error.message || "There was an issue submitting your form, please try later"
                });
            } finally {
            //delay loading
            setTimeout(() => {
                setIsLoading(false);
                }, 1000); 
            }
        };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product name *</FormLabel>
                            <FormControl>
                                <Input
                                placeholder="Product name"
                                className="input-class"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product SKU ( Auto generated ) *</FormLabel>
                            <FormControl>
                                <Input
                                placeholder="Product sku (eg. SKU-001)"
                                className="input-class"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="slug"
                        render={({ field }) => (
                        <FormItem className="hidden">
                            <FormLabel>Product Slug ( Auto generated ) *</FormLabel>
                            <FormControl>
                                <Input
                                placeholder="Product slug"
                                className="input-class"
                                disabled
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Product category"
                                    className="input-class"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Unit *</FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Stock intake unit"
                                    className="input-class"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="discount"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product Discount</FormLabel>
                            <FormControl>
                                <DiscountSelector  {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                    control={form.control}
                    name="allowDiscount"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Allow discount at counter *</FormLabel>
                        <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={String(field.value)}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Enable discounts at counter" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            <SelectItem value="false">Discounts ALLOWED at counter</SelectItem>
                            <SelectItem value="true">Discounts NOT allowed at counter</SelectItem>
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />


                    <FormField
                        control={form.control}
                        name="quantityAlert"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total minimum low stock quantity</FormLabel>
                            <FormControl>
                                <Input
                                type="number"
                                min="1"
                                placeholder="Low stock quantity"
                                className="input-class"
                                {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                
                </div>
                

                <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel className="inline-flex items-center mb-5 cursor-pointer">Status</FormLabel>
                        <FormControl>
                            <Switch
                                id="status"
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                    )}
                />
                



                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center border-b pb-10">
                        <div className="col-span-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                            <FormField
                                key={index}
                                control={control}
                                name={`variants.${index}.variantName`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Variant Name *</FormLabel>
                                    <FormControl>
                                        <Input
                                        placeholder="Enter variant name"
                                        className="input-class"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <FormField
                                    key={index}
                                    name={`variants.${index}.price`}
                                    control={form.control}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Selling Price *</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Selling price"
                                                className="input-class"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />
                                <FormField
                                    key={index}
                                    control={control}
                                    name={`variants.${index}.variantImage`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Variant image</FormLabel>
                                        <FormControl>
                                            <Input
                                            type="file"
                                            placeholder="Variant image"
                                            className="input-class"
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    key={index}
                                    control={form.control}
                                    name={`variants.${index}.discount`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Variant specific discount</FormLabel>
                                        <FormControl>
                                            <DiscountSelector  {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                <FormField
                                    key={index}
                                    control={form.control}
                                    name={`variants.${index}.allowDiscount`}
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Allow discount at counter *</FormLabel>
                                        <Select onValueChange={(value) => field.onChange(value === "true")} defaultValue={String(field.value)}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Enable discounts at counter" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            <SelectItem value="false">Discounts ALLOWED at counter</SelectItem>
                                            <SelectItem value="true">Discounts NOT allowed at counter</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <FormField
                                    key={index}
                                    name={`variants.${index}.minimumPrice`}
                                    control={form.control}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Variant minimum price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Minimum selling price"
                                                className="input-class"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                <FormField
                                    key={index}
                                    name={`variants.${index}.itemsPerUnit`}
                                    control={form.control}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Items per unit</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min="1"
                                                placeholder="Number of items per unit"
                                                className="input-class"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                    )}
                                />

                                <FormField
                                    key={index}
                                    control={form.control}
                                    name={`variants.${index}.status`}
                                    render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="inline-flex items-center mb-5 cursor-pointer">Variant status</FormLabel>
                                        <FormControl>
                                            <Switch
                                                id="status"
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                    )}
                                />
                        </div>

                        <div className="col-span-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {fields.length !== 1 && (
                                <Button type="button" variant="destructive" onClick={() => remove(index)}>
                                    <Minus className="mr-2 h-4 w-4" />
                                </Button>
                            )}
                            {fields.length - 1 === index && (
                                <Button type="button" variant="default" onClick={() => append({ variantName: '', variantImage: null, variantStatus: '' })}>
                                <Plus className="mr-2 h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    ))}

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Product description</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Short description of the product"
                                    className="resize-none"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex h-5 items-center space-x-4">
                    <CancelButton />
                
                    <Separator orientation="vertical" />

                    <Button type="submit">
                        {isLoading ? (
                            <>
                                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> &nbsp; Processing...
                            </>
                            ) : (
                            item ? "Update product" : "Create product"
                        )}
                    </Button> 
                </div>
            </form>
        </Form>
        );
    };
  
export default ProductForm;