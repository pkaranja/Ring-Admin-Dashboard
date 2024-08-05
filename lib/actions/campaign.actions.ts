'use server';

import {databaseCheck, handleError} from "@/lib/utils/actions-service";
import { ID, Query, AppwriteException } from "node-appwrite";
import { parseStringify } from "../utils";
import { Campaign } from "@/types";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation'

const {
    CAMPAIGN_COLLECTION: CAMPAIGN_COLLECTION_ID,
} = process.env;

export const createItem = async ( item: Campaign ) => {
  const { database, businessId, databaseId, collectionId } = await databaseCheck(CAMPAIGN_COLLECTION_ID, {needsBusinessId: true})
  try {
    await database.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      {
        ...item,
        businessId: businessId,
        status: true
      }
    )
  } catch (error: any) {
    handleError(error, "Error creating campaign");
  }

  revalidatePath('/dashboard/campaigns')
  redirect('/dashboard/campaigns')
}

export const list = async ( ) => {
  const { database, businessId, databaseId, collectionId } = await databaseCheck(CAMPAIGN_COLLECTION_ID, {needsBusinessId: true})

    try {
      const items = await database.listDocuments(
        databaseId,
        collectionId,
        [Query.equal('businessId', businessId!)]
      )

      if (items.documents.length == 0) return null

      return parseStringify(items.documents);

    }catch (error: any){
      handleError(error, "Error listing campaigns");
    }
}

export const getItems = async (
    q?: string,
    status?: boolean | null,
    limit?: number | null, 
    offset?: number | 1,
  ) => {
  const { database, businessId, databaseId, collectionId } = await databaseCheck(CAMPAIGN_COLLECTION_ID, {needsBusinessId: true})

    try {
      const queries = [];
      queries.push(Query.equal('businessId', businessId!));
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
        databaseId,
        collectionId,
        queries
      );
  
      if (items.documents.length == 0) return null
  
      return parseStringify(items.documents);
    } catch (error: any) {
      handleError(error, "Error getting campaigns");
    }
  }

export const getItem = async (id: string) => {
  if (!id) return null;
  const { database, databaseId, collectionId } = await databaseCheck(CAMPAIGN_COLLECTION_ID)

  try {
    const item = await database.listDocuments(
      databaseId,
      collectionId,
      [Query.equal('$id', id)]
    )

    if ( item.total == 0 ) return null;

    return parseStringify(item.documents[0]);
  } catch (error: any) {
    handleError(error, "Error getting campaign item");
  }
}

export const updateItem = async (id: string, data: Campaign) => {
  if (!id || !data ) return null;
  const { database, databaseId, collectionId } = await databaseCheck(CAMPAIGN_COLLECTION_ID)

    try {
      await database.updateDocument(
        databaseId,
        collectionId,
        id,
        data);
    } catch (error: any) {
      handleError(error, "Error updating campaign");
    }

    revalidatePath('/dashboard/campaigns')
    redirect('/dashboard/campaigns')
}