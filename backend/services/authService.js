import { supabase } from "../config/supabaseClient.js";

export default class AuthService {
  static async login(email, password) {
    try{
      const {data: authData, error: authError} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error("Invalid email or password");

      return{
        id: authData.user?.id,
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_in: authData.session?.expires_in
      };
    }catch (err) {
      console.error("Login Error:", err.message);
      throw err;
    }
  }

  static async refreshToken(refreshToken){
    try{
      if (!refreshToken) throw new Error("Tidak ada refresh Token, Silahkan Login Ulang");

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error) throw new Error("Refresh token error, message:", error.message);

      return {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_in: data.session?.expires_in,
      }
    }catch(err){
      console.error("Refresh token Error:", err.message);
      throw err;
    }
  }

  static async logout(refreshToken){
    try{
      if (!refreshToken) throw new Error("Anda telah Logout");

      await supabase.auth.admin.signOut(refreshToken);

      return true;      
    }catch(err){
      console.error("Logout Error:", err.message);
      throw err;
    }
  }
}


