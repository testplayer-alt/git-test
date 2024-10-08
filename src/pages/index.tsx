import Header from "./header";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { collection, doc, getDocs, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { onSnapshot } from "firebase/firestore"; // onSnapshotをインポート


export default function Home() {
  let [items, Setitems] = useState<any[]>([]); // 表示されるアイテムのリスト
  const [itemdata, setitemdata] = useState<any[]>([]); // Firebaseから取得したアイテムデータ
  const [update, setupdate] = useState<boolean>(false);

  useEffect(() => {
    const getitems = async () => {
      try {
        const docRef = collection(db, 'cart');
        const querySnapshot = await getDocs(docRef);
        const fetchedItems = querySnapshot.docs.map((doc) => doc.data().items); // items配列を取得
        setitemdata(fetchedItems.flat()); // 配列内のデータをフラット化して保存
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      }
    }
    getitems();
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "cart", 'incart'), function (doc) { // 修正: doc()を使用して参照を取得
      if (doc.metadata.hasPendingWrites) {
        // ローカルの変更がある場合は無視
        return;
      }
      const data = doc.data(); // データを取得
      if (data) { // dataがundefinedでないことを確認
        console.log("Server data: ", data);
        Setitems(data.items); // Setitemsにdataを設定
      }
    });

    return () => unsubscribe(); // クリーンアップ関数を追加
  }, [Setitems]);

  // 数量の増減
  async function plusminus(inputValue: string, num: number) {
    // Firestoreのコレクション内の特定のドキュメントを参照
    const docRef = doc(db, 'cart', 'incart');

    // ドキュメントのデータを取得
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const docData = docSnapshot.data();
      const items = docData.items || [];

      // 既存のアイテムを検索
      const existingItemIndex = items.findIndex((i: any) => i.id === inputValue);

      if (existingItemIndex !== -1) {
        const currentItem = items[existingItemIndex];

        // 数量を増減させるロジック
        if (num === 0 && currentItem.num > 1) {
          currentItem.num -= 1; // 数量を1減少
        } else if (num === 1) {
          currentItem.num += 1; // 数量を1増加
        }

        // 更新されたアイテムを反映した新しいitems配列を作成
        const updatedItems = [...items];
        updatedItems[existingItemIndex] = currentItem;
        Setitems(updatedItems);

        // Firestoreに更新されたitems配列を保存
        await updateDoc(docRef, {
          items: updatedItems
        });

        console.log(`アイテム ${inputValue} の数量を更新しました。新しい数量: ${currentItem.num}`);
      } else {
        console.log("該当するアイテムが見つかりませんでした");
      }
    } else {
      console.error("ドキュメントが存在しません");
    }
  }

  // アイテムの取り消し関数
  async function cansel(inputValue: string) {

    const updatedItems = items.filter(item => item.id !== inputValue);
    Setitems(updatedItems); // ローカル状態を更新
    const docRef = doc(collection(db, 'cart'), 'incart');
    setDoc(docRef, { items: updatedItems })
      .catch((error) => {
        console.error("データの削除に失敗しました:", error); // エラーハンドリング
      });

  }


  // 合計金額の計算
  const Result = () => {
    let result = 0;
    for (let i = 0; i < items.length; i++) {
      result += parseInt(items[i].money) * items[i].num;
    }
    return result;
  };

  return (
    <div className="font-sans text-[#d4d4d4]">
      <Header />
      <Link href={"/setting/setitem"}>ページに戻る</Link>
      <h1 className="text-[3rem] text-center">商品</h1>
      <div className="w-full">
        {items.map((item: any, index: number) => (
          <div key={index} className="w-[80%] p-4 m-auto flex bg-[#373737] rounded-2xl border-2 border-[#474747] mb-1 h-[7rem]">
            <div className="w-full align-bottom">
              <p className="text-[30px] text-center mt-[1rem]">{item.name}</p>
            </div>
            <div className="m-auto flex">
              <div className="block w-[8rem]">
                <p>単価:{item.money}円</p>
                <p>数:{item.num}個</p>
                <p>合計:{parseInt(item.money) * item.num}円</p>
              </div>
              <div className="font-bold">
                <Button onClick={() => plusminus(item.id, 0)} id={item.id}>ー</Button>
                <Button onClick={() => plusminus(item.id, 1)} id={item.id}>＋</Button>
                <Button onClick={() => cansel(item.id)} id={item.id}>取り消し</Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-[80%]">
        <p className="text-[50px] font-bold font-sans text-right">合計:{Result()}円</p>
      </div>
    </div>
  );
}
