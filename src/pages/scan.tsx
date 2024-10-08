import { useState, useEffect, useRef } from "react";
import { App, ChildMethods } from "@/components/App";
import { collection, doc, getDocs, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Scan() {
    const [id, setid] = useState<any>();
    const inid = useRef<any>();
    const [itemdata, setitemdata] = useState<any[]>([]);
    const [isCooldown, setIsCooldown] = useState(false);  // クールダウン用のフラグ
    const childRef = useRef<ChildMethods>(null);
    const [items, Setitems] = useState<any[]>([]);
    const router = useRouter();
    const Department = router.query.dep;
    console.log("取得した部門:", Department);

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
                console.error("データの取得に失敗しました:", error);
            }
        };
        fetchData();
    }, [id]);

    // アイテムの更新処理
    const Update = async () => {
        if (!Department) {
            console.log("部門が未定義です。");
            return;
        }

        if (isCooldown) {
            console.log("クールダウン中です。更新をスキップします。");
            return;
        }

        if (!id?.value) {
            return;
        }

        setIsCooldown(true);  // クールダウンを開始

        const fetchBooks = async () => {
            try {
                console.log("最新のアイテム情報を取得中...");
                const docRefitem = doc(db, 'cart', `${Department}`);
                const querySnapshotitem = await getDoc(docRefitem);
                const fetchedItemsitem = querySnapshotitem.data()?.items || []; // 修正: data()メソッドを使用
                Setitems(fetchedItemsitem || []); // 修正: 空配列を返す
                console.log("バーコード読み込み時に最新アイテムを取得:", fetchedItemsitem.flat());
            } catch (error) {
                console.error("データの取得に失敗しました:", error);
            }
            try {
                console.log("最新のアイテム情報を取得中...");
                const docRef = collection(db, 'items');
                const querySnapshot = await getDocs(docRef);
                const fetchedItems = querySnapshot.docs.map((doc) => doc.data().items || []);
                setitemdata(fetchedItems.flat());
                console.log("取得した最新アイテム:", fetchedItems.flat());
            } catch (error) {
                console.error("データの取得に失敗しました:", error);
            }
        };

        await fetchBooks();

        // 10秒後にクールダウン解除
        setTimeout(() => {
            setIsCooldown(false);  // クールダウン解除
            console.log("クールダウン解除");
        }, 2500);  // 10秒後にクールダウン解除
    };

    // アイテムの追加または更新
    useEffect(() => {
        if (!id?.value || !Department) {
            console.log("IDまたは部門が無効か空です。");
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
    }, [itemdata, id, Department]);

    // アイテムデータのデータベースへの保存
    useEffect(() => {
        if (items.length > 0 && Department) {
            console.log("データベースに保存するアイテム:", items);
            const docRef = doc(db, 'cart', String(Department));

            const saveItemsToFirestore = async () => {
                try {
                    // 更新されたアイテムリストをFirestoreに保存
                    await updateDoc(docRef, {
                        items: items
                    });
                    console.log(items);
                    console.log("データが正常に更新されました。");
                } catch (error) {
                    // ドキュメントが存在しない場合は新しいドキュメントを作成
                    await setDoc(docRef, { items: items });
                    console.log("新しいドキュメントが作成されました。");
                }
            };

            saveItemsToFirestore();
        }
    }, [items, Department]);

    // Update を1秒間に1回実行（クールダウンの問題を解決するため、1000msに変更）
    useEffect(() => {
        if (!Department) {
            console.log("部門が未定義です。");
            return;
        }

        const intervalId = setInterval(() => {
            Update();
        }, 1000); // 1000msごとに実行

        return () => clearInterval(intervalId);
    }, [id, Department]);

    // ボタンをクリックしたときの処理
    const clickButton = (pass: number) => {
        let URL = "";
        switch (pass) {
            case 0:
                URL = "/";
                break;

            case 1:
                URL = "/setting/setitem";
                break;
            default:
                break;
        }
        router.push({
            pathname: URL,   //URL
            query: { dep: Department } //検索クエリ
        });
    }

    return (
        <>
            <App ref={childRef} />
            <Button onClick={() => clickButton(0)}>カートページ</Button>
            <Button onClick={() => clickButton(1)}>アイテム登録</Button>
        </>
    );
}
