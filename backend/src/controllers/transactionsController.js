import { sql } from "../config/db.js";

export async function getTransactionsByUserId(req, res) {
     try{
        const {userId} =req.params;
      
        const transaction = await sql`SELECT * FROM transactions WHERE user_id = ${userId} ORDER BY created_at DESC`;
        //  console.log(transaction)
        res.status(200).json(transaction)
    
        }
        catch(error){
            console.log("error fetching user_id",error);
            res.status(500).json({message:"Internal server error"})
        }
}

export async function createTransaction(req,res){
    try {
            const {title,amount,category,user_id} = req.body;
            console.log(req.body)
    
            if (!title || !user_id || !category || amount === undefined ){
                return res.status(400).json({message:"All field are required"});
            }
    
            const transaction = await sql`INSERT INTO transactions(user_id,title,amount,category)
             VALUES (${user_id}, ${title}, ${amount}, ${category})
            RETURNING * 
            `;
            
            res.status(201).json(transaction[0]);
    
    
        } catch (error) {
            console.log("Error creating a transaction")
            res.status(500).json({message:"internal server error"});
        }

}

export async function deleteTransaction(req,res) {
     
        try {
            const {id} = req.params;
            console.log(id)
            if(isNaN(parseInt(id))){
                return res.status(400).json({message:"Invalid transaction Id"})
            }
        
            const result = await sql`DELETE FROM transactions WHERE id = ${id} RETURNING * `;
            
            if (result.length == 0){
               return res.status(404).json({message:"transaction not found."})
            }
    
            res.status(200).json({message:"transaction deleted successfully."})
        }catch(error){
            console.log("error fetching user_id",error);
            res.status(500).json({message:"Internal server error"})
            
        }
    }

export async function getSummaryByUserId(req,res) {
    
         try {
        const { userId } = req.params;
    
        const balanceResult = await sql`
          SELECT COALESCE(SUM(amount), 0) as balance FROM transactions WHERE user_id = ${userId}
        `;
    
        const incomeResult = await sql`
          SELECT COALESCE(SUM(amount), 0) as income FROM transactions
          WHERE user_id = ${userId} AND amount > 0
        `;
    
        const expensesResult = await sql`
          SELECT COALESCE(SUM(amount), 0) as expenses FROM transactions
          WHERE user_id = ${userId} AND amount < 0
        `;
    
        res.status(200).json({
          balance: balanceResult[0].balance,
          income: incomeResult[0].income,
          expenses: expensesResult[0].expenses,
        });
      } catch (error) {
        console.log("Error gettin the summary", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }

