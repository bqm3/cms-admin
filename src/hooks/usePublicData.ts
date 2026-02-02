/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from "react";
import api from "../services/api";

export function usePublicData() {
    const [categories, setCategories] = useState<any[]>([]);
    const [parentCategories, setParentCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const [catRes, parentRes] = await Promise.all([
                api.get("/categories"),
                api.get("/parent-categories"),
            ]);
            setCategories(catRes.data.categories || catRes.data || []);
            setParentCategories(parentRes.data.parentCategories || parentRes.data || []);
        } catch (err) {
            console.error("Error fetching public categories:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { categories, parentCategories, loading, refetch: fetchData };
}
