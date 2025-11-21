import { supabase } from "../config/supabaseClient.js";

export default class userService {
    static async getUser(userId){
        try{
            let profile = null

            const {data: dataMhs, error: errorMhs} = await supabase
                .from("mahasiswa")
                .select("*")
                .eq("id", userId)
                .maybeSingle();
            if (errorMhs) throw errorMhs;
            if (dataMhs) profile = dataMhs;

            const {data: dataKons, error: errorKons} = await supabase
                .from("konselor")
                .select("*")
                .eq("id", userId)
                .maybeSingle();
            if (errorKons) throw errorKons;
            if (dataKons) profile = dataKons;

            return profile;
        } catch (err) {
            console.error("Terjadi error ketika getUser: ", err.message);
            throw err;
        }
    }
}