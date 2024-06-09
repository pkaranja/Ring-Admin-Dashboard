'use client'

import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { format } from "date-fns"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Campaign } from "@/types";
import { createItem, updateItem } from "@/lib/actions/campaign.actions"
import CancelButton from "../layout/cancel-button";
import { CampaignAudience, CampaignSchema } from "@/types/data-schemas";
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "@radix-ui/react-icons"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation";

import * as z from "zod";
import { SubmitButton } from "@/components/ui/submit-button";
import { useFormState } from 'react-dom';
import { useToastMessage } from '@/hooks/use-toast-messages';
import { useFormReset } from '@/hooks/use-form-reset';
import { EMPTY_FORM_STATE } from '@/lib/utils/zod-form-state';
import { FieldError } from '@/components/ui/field-error';

import { fromErrorToFormState, toFormState,} from '@/lib/utils/zod-form-state';
import { revalidatePath } from 'next/cache';

//TODO: Implement campaign type and status

const CampaignForm = ({ item }: { item?: Campaign | null }) => {
    const router = useRouter();
  
    const form = useForm({
      resolver: zodResolver(CampaignSchema),
      defaultValues: item ? item : {},
    });
  
    const [formState, action] = useFormState( createItem, EMPTY_FORM_STATE );
    const formRef = useFormReset(formState);

    console.log('formState', formState);
  
    const onInvalid = (error: any) => {
        formState.status = 'ERROR';
        formState.message = 'Data validation failed!';
        return fromErrorToFormState(error);
    };
  
    const onSubmit = async (data: z.infer<typeof CampaignSchema>) => {
        formState.status = 'UNSET';
        try {
            if (item) {
                await updateItem(item.$id!, data);
            } else {
                await createItem(data, EMPTY_FORM_STATE);
            }
            formState.status = 'SUCCESS';
            formState.message = 'Succesfully submitted campaign data';
            router.push("/campaigns");
        } catch (error: any) {
            formState.status = 'ERROR';
            return fromErrorToFormState(error);
        }finally{
            formState.status = 'UNSET';
        }
    };

    const noScriptFallback = useToastMessage(formState);
  
    return (
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} ref={formRef} className="space-y-8">
          <div className="grid grid-cols-3 gap-4">
            <FormField
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Title"
                      className="input-class"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              name="audience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Audience *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={CampaignAudience.ALL}>All ( Customers & Staff )</SelectItem>
                      <SelectItem value={CampaignAudience.CUSTOMERS}>Customers</SelectItem>
                      <SelectItem value={CampaignAudience.STAFF}>Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
  
            <FormField
              name="scheduleDate"
              render={({ field }) => (
                <FormItem className="flex flex-col mt-2">
                  <FormLabel>Campaign date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant={"outline"} className={cn("font-normal", !field.value && "text-muted-foreground")}>
                          {field.value ? format(field.value, "PPP") : (
                            <span>Select date to send your message</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date() || date < new Date("1970-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
  
          <FormField
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter campaign message"
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
            <SubmitButton label={item ? "Re-broadcast campaign" : "Broadcast campaign"} loading="Processing..." />
          </div>

          {noScriptFallback}

        </form>
      </FormProvider>
    );
  };
  
  export default CampaignForm;