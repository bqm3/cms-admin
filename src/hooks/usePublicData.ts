/* eslint-disable prettier/prettier */
import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useInitialPublicData } from "../context/PublicDataInitialContext";

export function usePublicData() {
    const initialData = useInitialPublicData();
    const [categories, setCategories] = useState<any[]>(initialData.categories || []);
    const [parentCategories, setParentCategories] = useState<any[]>(initialData.parentCategories || []);
    const [loading, setLoading] = useState(!initialData.categories && !initialData.parentCategories);

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
        if (initialData.categories || initialData.parentCategories) return;
        fetchData();
    }, [fetchData, initialData.categories, initialData.parentCategories]);

    return { categories, parentCategories, loading, refetch: fetchData };
}
