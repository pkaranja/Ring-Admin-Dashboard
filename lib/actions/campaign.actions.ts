'use server';

const env = process.env.NODE_ENV
import * as Sentry from "@sentry/nextjs";
import { ID, Query, AppwriteException } from "node-appwrite";
import { createAdminClient } from "../appwrite";
import { parseStringify } from "../utils";
import { Campaign } from "@/types";
import { getStatusMessage, HttpStatusCode } from '../status-handler'; 
import { getBusinessId } from "./business.actions";

import { revalidatePath } from 'next/cache';
import { FormState, fromErrorToFormState, toFormState,} from '@/lib/utils/zod-form-state';

const {
    APPWRITE_DATABASE: DATABASE_ID,
    CAMPAIGN_COLLECTION: CAMPAIGN_COLLECTION_ID,
} = process.env;

export const createItem = async ( item: Campaign, formState: FormState ) => {
  console.log("SUBMITTED DATA", item)
  try {
    if (!DATABASE_ID || !CAMPAIGN_COLLECTION_ID) {
      throw Error('Database ID or Collection ID is missing');
    }

    const { database } = await createAdminClient();
    const businessId = await getBusinessId();
    if( !businessId ) throw new Error('Business ID could not be initiated');

    await database.createDocument(
      DATABASE_ID,
      CAMPAIGN_COLLECTION_ID,
      ID.unique(),
      {
        ...item,
        businessId: businessId,
        status: true
      }
    );
  } catch (error : any) {
    return fromErrorToFormState(error);
  }

  revalidatePath('/campaigns');
  return toFormState('SUCCESS', 'Campaign created');
}

  export const list = async ( ) => {
    try {
      if (!DATABASE_ID || !CAMPAIGN_COLLECTION_ID) throw new Error('Database ID or Collection ID is missing');

      const { database } = await createAdminClient();
      if( !database ) throw new Error('Database could not be initiated');

      const businessId = await getBusinessId();
      if( !businessId ) throw new Error('Business ID could not be initiated');

      const items = await database.listDocuments(
        DATABASE_ID,
        CAMPAIGN_COLLECTION_ID,
        [Query.equal('businessId', businessId!)]
      );

      return parseStringify(items.documents);

    }catch (error: any){
      let errorMessage = 'Something went wrong with your request, please try again later.';
      if (error instanceof AppwriteException) {
        errorMessage = getStatusMessage(error.code as HttpStatusCode);
      }
  
      if(env == "development"){ console.error(error); }
  
      Sentry.captureException(error);
      throw Error(errorMessage);
    }
  };

  export const getItems = async (
    q?: string,
    status?: boolean | null,
    limit?: number | null, 
    offset?: number | 1,
  ) => {
    if (!DATABASE_ID || !CAMPAIGN_COLLECTION_ID) {
      throw new Error('Database ID or Collection ID is missing');
    }
  
    try {
      const { database } = await createAdminClient();
      const queries = [];

      const businessId = await getBusinessId();
      if( !businessId ) throw new Error('Business ID could not be initiated');

      queries.push(Query.equal('businessId', businessId));
      queries.push(Query.orderDesc("$createdAt"));

      if ( limit ) {
        queries.push(Query.limit(limit));
        queries.push(Query.offset(offset!));
      }
  
      if (q) {
        queries.push(Query.search('title', q));
      }
  
      if (status) {
        queries.push(Query.equal('status', status));
      }
  
      const items = await database.listDocuments(
        DATABASE_ID,
        CAMPAIGN_COLLECTION_ID,
        queries
      );
  
      if (items.documents.length === 0) {
        return [];
      }
  
      return parseStringify(items.documents);
    } catch (error: any) {
      let errorMessage = 'Something went wrong with your request, please try again later.';
      if (error instanceof AppwriteException) {
        errorMessage = getStatusMessage(error.code as HttpStatusCode);
      }

      if(env == "development"){ console.error(error); }

      Sentry.captureException(error);
      throw Error(errorMessage);
    }
  }

  export const getItem = async (id: string) => {
    try {
      if (!DATABASE_ID || !CAMPAIGN_COLLECTION_ID) {
        throw new Error('Database ID or Collection ID is missing');
      }

      if (!id) {
        throw new Error('Document ID is missing');
      }

      const { database } = await createAdminClient();
  
      const item = await database.listDocuments(
        DATABASE_ID!,
        CAMPAIGN_COLLECTION_ID!,
        [Query.equal('$id', id)]
      )
  
      return parseStringify(item.documents[0]);
    } catch (error: any) {
        let errorMessage = 'Something went wrong with your request, please try again later.';
        if (error instanceof AppwriteException) {
          errorMessage = getStatusMessage(error.code as HttpStatusCode);
        }
  
        if(env == "development"){ console.error(error); }
  
        Sentry.captureException(error);
        throw Error(errorMessage);
    }
  }

  export const deleteItem = async ({ $id }: Campaign) => {
    try {
      if (!DATABASE_ID || !CAMPAIGN_COLLECTION_ID) {
        throw new Error('Database ID or Collection ID is missing');
      }

      const { database } = await createAdminClient();
  
      const item = await database.deleteDocument(
        DATABASE_ID!,
        CAMPAIGN_COLLECTION_ID!,
        $id);
  
      return parseStringify(item);
    } catch (error: any) {
        let errorMessage = 'Something went wrong with your request, please try again later.';
        if (error instanceof AppwriteException) {
          errorMessage = getStatusMessage(error.code as HttpStatusCode);
        }
  
        if(env == "development"){ console.error(error); }
  
        Sentry.captureException(error);
        throw Error(errorMessage);
    }
  }

  export const updateItem = async (id: string, data: Campaign) => {  
    try {
      if (!DATABASE_ID || !CAMPAIGN_COLLECTION_ID) {
        throw new Error('Database ID or Collection ID is missing');
      }

      const { database } = await createAdminClient();
  
      const item = await database.updateDocument(
        DATABASE_ID!,
        CAMPAIGN_COLLECTION_ID!,
        id,
        data);
  
      return parseStringify(item);
    } catch (error: any) {
        let errorMessage = 'Something went wrong with your request, please try again later.';
        if (error instanceof AppwriteException) {
          errorMessage = getStatusMessage(error.code as HttpStatusCode);
        }
  
        if(env == "development"){ console.error(error); }
  
        Sentry.captureException(error);
        throw Error(errorMessage);
    }
  }