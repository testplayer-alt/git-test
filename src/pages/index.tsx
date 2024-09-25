import Header from "./header";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

export default function Home() {
  let [items, Setitems] = useState<any[]>([]); // 表示されるアイテムのリスト
  const [itemdata, setitemdata] = useState<any[]>([]); // Firebaseから取得したアイテムデータ

  // Firebaseからデータを取得する関数
  const fetchBooks = async () => {
    try {
      const docRef = collection(db, 'items'); // "items"コレクションを参照
      const querySnapshot = await getDocs(docRef);
      const fetchedItems = querySnapshot.docs.map((doc) => doc.data().items); // items配列を取得
      setitemdata(fetchedItems.flat()); // 配列内のデータをフラット化して保存
      console.log("取得されたデータ:", fetchedItems.flat());
    } catch (error) {
      console.error("データの取得に失敗しました:", error);
    }
  };

  // アイテムの追加処理
  async function handleSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    const itemInput = document.getElementById('itemid') as HTMLInputElement | null;
    const inputValue = itemInput?.value; // 入力値を取得

    console.log("入力されたID:", inputValue);

    if (!inputValue) return; // 入力がない場合は終了

    // Firebaseからデータを取得
    await fetchBooks();
    const foundItem = itemdata.find((item: any) => item.id === inputValue);

    if (foundItem) {
      const existingItemIndex = items.findIndex((i: any) => i.id === foundItem.id);

      if (existingItemIndex !== -1) {
        // 既にアイテムが存在する場合、その数量を増加
        const updatedItems = [...items];
        updatedItems[existingItemIndex].num++;
        Setitems(updatedItems);
      } else {
        // 新しいアイテムを追加
        Setitems([...items, { ...foundItem, num: 1 }]);
      }

      console.log("現在のアイテム:", items);
    } else {
      console.log('該当するアイテムがありません');
    }
  };

  // 数量の増減
  function plusminus(inputValue: string, num: number) {
    const existingItemIndex = items.findIndex((i) => i.id === inputValue);
    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      if (num === 0 && updatedItems[existingItemIndex].num > 1) {
        updatedItems[existingItemIndex].num--;
      } else if (num === 1) {
        updatedItems[existingItemIndex].num++;
      }
      Setitems(updatedItems);
    }
  }

  // アイテムの取り消し
  function cansel(inputValue: string) {
    const existingItemIndex = items.findIndex((i) => i.id === inputValue);
    if (existingItemIndex !== -1) {
      const updatedItems = [...items];
      updatedItems.splice(existingItemIndex, 1); // アイテムを配列から削除
      Setitems(updatedItems);
    }
  }

  // 合計金額の計算
  const Result = () => {
    let result = 0;
    for (let i = 0; i < items.length; i++) {
      result += parseInt(items[i].money) * items[i].num;
    }
    return result;
  };

  // Enterキーでアイテムを追加
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.key !== 'Enter') return;
    await handleSubmit(e); // Enterキーが押されたらアイテムを追加
  };

  return (
    <div className="font-sans text-[#d4d4d4]">
      <Header />
      <Link href={"/setting/setitem"}>ページに戻る</Link>
      <h1 className="text-[3rem] text-center">商品</h1>
      <div className="text-center">
        <input onKeyDown={handleKeyDown} className="text-black" id="itemid" type="text" />
      </div>
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
