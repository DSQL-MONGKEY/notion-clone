import { v } from "convex/values"
import { mutation, query } from "./_generated/server"
import { Doc, Id } from "./_generated/dataModel"

export const create = mutation({
   args: {
      title: v.string(),
      parentDocument: v.optional(v.id("documents"))
   },
   handler:async (context, args) => {
      const identity = await context.auth.getUserIdentity()

      if(!identity) {
         throw new Error("Not authenticated")
      }
      const userId = identity.subject

      const document = await context.db.insert("documents", {
         title: args.title,
         parentDocument: args.parentDocument,
         userId: userId,
         isArchived: false,
         isPublished: false
      })
      return document
   }
})

export const getSidebar = query({
   args: {
      parentDocument: v.optional(v.id("documents"))
   },
   handler: async(context, args) => {
      const identity = await context.auth.getUserIdentity()

      if(!identity) {
         throw new Error("Not authenticated")
      }

      const userId = identity.subject

      const documents = await context.db
         .query("documents")
         .withIndex("by_user_parent", (query) => query
            .eq("userId", userId)
            .eq("parentDocument", args.parentDocument)
         )
         .filter((query) => query.eq(query.field("isArchived"), false))
         .order("desc")
         .collect()

         return documents
   }
})