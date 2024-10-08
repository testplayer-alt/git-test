import Header from "./header";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { collection, doc, getDocs, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { onSnapshot } from "firebase/firestore";
import { useRouter } from "next/router";

export default function Home() {
  const [items, Setitems] = useState<any[]>([]); // 表示されるアイテムのリスト
  const [itemdata, setitemdata] = useState<any[]>([]); // Firebaseから取得したアイテムデータ
  const [update, setupdate] = useState<boolean>(false);
  const router = useRouter();
  const Department = router.query.dep; // URLから部門を取得
  console.log("取得した部門:", Department);

  useEffect(() => {
    const getItems = async () => {
      if (!Department) {
        console.log("部門が未定義");
        return;
      }

      try {
        // 'cart'コレクションの中のDepartmentを参照
        const departmentRef = collection(db, 'cart', String(Department), 'items');
        const querySnapshot = await getDocs(departmentRef);

        // 取得したアイテムをマッピング
        const fetchedItems = querySnapshot.docs.map((doc) => doc.data()); // ここでは items 配列の代わりにドキュメントデータそのものを取得
        setitemdata(fetchedItems); // フラット化は不要なら省略
        console.log("取得されたアイテム:", fetchedItems);
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      }
    };

    getItems();
  }, [Department]);

  useEffect(() => {
    if (!Department) {
      console.log("部門が未定義");
      return;
    }

    const unsubscribe = onSnapshot(doc(db, "cart", String(Department)), (doc) => {
      if (doc.metadata.hasPendingWrites) {
        // ローカルの変更がある場合は無視
        return;
      }
      const data = doc.data(); // データを取得
      if (data) { // dataがundefinedでないことを確認
        console.log("サーバーデータ: ", data);
        Setitems(data.items); // Setitemsにdataを設定
      }
    });

    return () => unsubscribe(); // クリーンアップ関数を追加
  }, [Department, Setitems]);

  // 数量の増減
  async function plusminus(inputValue: string, num: number) {
    const docRef = doc(db, 'cart', String(Department));

    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const docData = docSnapshot.data();
      const items = docData.items || [];

      const existingItemIndex = items.findIndex((i: any) => i.id === inputValue);

      if (existingItemIndex !== -1) {
        const currentItem = items[existingItemIndex];

        if (num === 0 && currentItem.num > 1) {
          currentItem.num -= 1;
        } else if (num === 1) {
          currentItem.num += 1;
        }

        const updatedItems = [...items];
        updatedItems[existingItemIndex] = currentItem;
        Setitems(updatedItems);

        await updateDoc(docRef, {
          items: updatedItems,
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
    const updatedItems = items.filter((item) => item.id !== inputValue);
    Setitems(updatedItems); // ローカル状態を更新
    const docRef = doc(db, 'cart', String(Department));
    setDoc(docRef, { items: updatedItems }).catch((error) => {
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

  // ボタンをクリックしたときの処理
  const clickButton = (pass: number) => {
    let URL = "";
    switch (pass) {
      case 0:
        URL = "/scan";
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
    <div className="font-sans text-[#d4d4d4]">
      <Header />
      <h1 className="text-[3rem] text-center">商品</h1>
      <div className="w-full">
        {items.map((item: any, index: number) => (
          <div
            key={index}
            className="w-[80%] p-4 m-auto flex bg-[#373737] rounded-2xl border-2 border-[#474747] mb-1 h-[7rem]"
          >
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
                <Button onClick={() => plusminus(item.id, 0)} id={item.id}>
                  ー
                </Button>
                <Button onClick={() => plusminus(item.id, 1)} id={item.id}>
                  ＋
                </Button>
                <Button onClick={() => cansel(item.id)} id={item.id}>
                  取り消し
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-[80%]">
        <p className="text-[50px] font-bold font-sans text-right">
          合計:{Result()}円
        </p>
      </div>
      <Button onClick={() => clickButton(0)}>スキャンページ</Button>
      <Button onClick={() => clickButton(1)}>アイテム登録</Button>
    </div>
  );
}
