import { useState, useEffect, useRef } from "react";
import { App, ChildMethods } from "@/components/App";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Scan() {
    const [id, setid] = useState<any>();
    const inid = useRef<any>();
    const [itemdata, setitemdata] = useState<any[]>([]);
    const [isCooldown, setIsCooldown] = useState(false);
    const childRef = useRef<ChildMethods>(null);
    const [items, Setitems] = useState<any[]>([]);

    // 初期データ取得
    useEffect(() => {
        const itemIdElement = document.getElementById('itemid') as HTMLInputElement;
        setid(itemIdElement ? itemIdElement : null);
        inid.current = itemIdElement ? itemIdElement : null;

        const fetchData = async () => {
            try {
                console.log("データベースから 'items' コレクションのデータを取得中...");
                const docRef = collection(db, 'items');
                const querySnapshot = await getDocs(docRef);
                const fetchedItems = querySnapshot.docs.map((doc) => doc.data().items || []); // 空配列を返す
                setitemdata(fetchedItems.flat());
                console.log("取得したアイテムデータ:", fetchedItems.flat());
            } catch (error) {
                console.error("データの取得に失敗しました.:", error);
            }
        };
        fetchData();
    }, [id]);

    // アイテムの更新処理
    const Update = async () => {
        if (isCooldown || !id?.value) {
            console.log("クールダウン中またはIDが無効です。更新をスキップします。");
            return;
        }

        setIsCooldown(true);
        setTimeout(() => {
            setIsCooldown(false);
            console.log("クールダウン解除");
        }, 2500);

        const fetchBooks = async () => {
            try {

                const docRef2 = collection(db, 'cart');
                const querySnapshot2 = await getDocs(docRef2);
                const fetchedItems2 = querySnapshot2.docs.map((doc) => doc.data().items || []);
                const validItems2 = fetchedItems2.flat().filter(item => item !== undefined);
                Setitems(validItems2);

                console.log("最新のアイテム情報を取得中...");
                const docRef = collection(db, 'items');
                const querySnapshot = await getDocs(docRef);
                const fetchedItems = querySnapshot.docs.map((doc) => doc.data().items || []);
                setitemdata(fetchedItems.flat());
                console.log("取得した最新アイテム:", fetchedItems.flat());
                console.log("取得したカート内のアイテム:", validItems2);
            } catch (error) {
                console.error("データの取得に失敗しました:", error);
            }
        };

        await fetchBooks();
    };

    // アイテムの追加または更新
    useEffect(() => {
        if (!id?.value) {
            console.log("IDが無効か空です。");
            return;
        }

        console.log("入力されたID:", id.value);
        const foundItem = itemdata.find((item: any) => item?.id === id?.value);
        childRef.current?.exitcode();

        if (foundItem) {
            console.log("該当アイテムが見つかりました:", foundItem);
            const existingItemIndex = items.findIndex((i: any) => i?.id === foundItem.id);
            if (existingItemIndex !== -1) {
                console.log("既存アイテムの数量を増加させます。");
                const updatedItems = [...items];
                updatedItems[existingItemIndex].num++;
                Setitems(updatedItems);
                console.log("更新後のアイテムリスト:", updatedItems);
            } else {
                console.log("新しいアイテムを追加します。");
                Setitems([...items, { ...foundItem, num: 1 }]);
                console.log("新規追加後のアイテムリスト:", [...items, { ...foundItem, num: 1 }]);
            }
        } else {
            console.log("該当するアイテムが見つかりませんでした。");
        }
    }, [itemdata, id]);

    // アイテムデータのデータベースへの保存
    useEffect(() => {
        if (items.length > 0) {
            console.log("データベースに保存するアイテム:", items);
            const validItems = items.filter(item => item !== undefined);

            if (validItems.length > 0) {
                const docRef = doc(collection(db, 'cart'), 'incart');
                setDoc(docRef, { items: validItems })
                    .then(() => {
                        console.log("データが正常にデータベースに保存されました。");
                    })
                    .catch((error) => {
                        console.error("データの保存に失敗しました:", error);
                    });
            }
        }
    }, [items]);

    // Update を1秒間に10回実行
    useEffect(() => {
        const intervalId = setInterval(() => {
            Update();
        }, 100); // 100msごとに実行

        return () => clearInterval(intervalId);
    }, [id]);

    return (
        <>
            <App ref={childRef} />
            <Button><Link href="/">カートページ</Link></Button>
            <Button><Link href="/setting/setitem">アイテム登録</Link></Button>
        </>
    );
}
