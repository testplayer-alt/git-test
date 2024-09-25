import { Scanner } from "@/components/Scanner";
import { App } from "@/components/App";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, getDocs, query, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

export default function Account() {
    const Setitems = async () => {
        const id = document.getElementById('itemid') as HTMLInputElement | null;
        const itemid = id?.value; // 入力値を取得
        const name = document.getElementById('itemname') as HTMLInputElement | null;
        const itemname = name?.value; // 入力値を取得
        const money = document.getElementById('itemmoney') as HTMLInputElement | null;
        const itemmoney = money?.value; // 入力値を取得

        console.log(itemid);
        console.log(itemname);
        console.log(itemmoney);

        const docRef = doc(db, 'items', 'allitem');

        // 既存のアイテムを確認する
        try {
            const docSnap = await getDoc(docRef);
            const existingItems = docSnap.data()?.items || [];

            // IDがすでに存在するか確認
            const exists = existingItems.some((item: { id: string }) => item.id === itemid);
            if (exists) {
                console.log('このIDは既に存在します:', itemid);
                return; // IDが存在する場合は処理を中止
            }

            const data = {
                id: itemid,
                name: itemname,
                money: itemmoney,
                num: 1,
            };

            await updateDoc(docRef, {
                items: arrayUnion(data) // items配列に新しいアイテムを追加
            });
            console.log('アイテムを追加しました:', data);
        } catch (error) {
            console.error('アイテムの追加中にエラーが発生しました:', error);
        }
    }

    return (
        <>
            <div className="font-sans text-[#d4d4d4]">
                <div>
                    <h1 className="text-[3rem] text-center">商品を追加</h1>
                    <div className="w-[20rem] m-auto">
                        <div className="m-1 flex">
                            <p className="w-[4rem]">Name:</p>
                            <input className="text-black" id="itemname" type="text" />
                        </div>
                        <div className="m-1 flex">
                            <p className="w-[4rem]">Money:</p>
                            <input className="text-black" id="itemmoney" type="number" />
                        </div>
                        <div className="w-full text-center">
                            <Button className="border-2 border-[#7f7f7f]" onClick={Setitems}>追加</Button>
                        </div>
                    </div>
                </div>
                <App></App>
                <Link href="/">ページに戻る</Link>
            </div>
        </>
    );
}
