import Header from "./header";
import { useState } from "react";
import { Button } from "@/components/ui/button";
export default function Home() {
  let [Updata, SetUpdata] = useState(false);
  let [items, Setitems] = useState<any[]>([]); // itemsの初期値を空配列に設定

  let item: any = {
    "000": {
      "id": "000",
      "name": "item00",
      "money": "100",
      "num": 1
    },
    "001": {
      "id": "001",
      "name": "item01",
      "money": "200",
      "num": 1
    },
    "002": {
      "id": "002",
      "name": "item02",
      "money": "300",
      "num": 1
    },
    "003": {
      "id": "003",
      "name": "item03",
      "money": "400",
      "num": 1
    },
    "004": {
      "id": "004",
      "name": "item04",
      "money": "500",
      "num": 1
    }
  }

  const handleSubmit = (
    e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    const itemInput = document.getElementById('itemid') as HTMLInputElement | null;
    const inputValue = itemInput?.value; // 入力値を取得

    console.log(inputValue); // nullチェックを追加
    if (inputValue && item[inputValue]) {
      console.log(item[inputValue].id);
      console.log(item[inputValue].name);
      console.log(item[inputValue].money);

      const existingItemIndex = items.findIndex((i: any) => i.id === item[inputValue].id);

      if (existingItemIndex !== -1) {
        // 既にアイテムが存在する場合、その数量を更新
        const updatedItems = [...items];
        updatedItems[existingItemIndex].num++;
        Setitems(updatedItems);
      } else {
        // 新しいアイテムを追加
        Setitems([...items, item[inputValue]]);
      }

      console.log(items);
    } else {
      console.log('該当するアイテムがありません');
    }
  }

  function plusminus(inputValue: any, num: any) {
    const existingItemIndex = items.findIndex((i: any) => i.id === item[inputValue].id);
    if (inputValue && item[inputValue]) {
      if (num == 0) {
        const updatedItems = [...items];
        if (updatedItems[existingItemIndex].num > 1) {
          updatedItems[existingItemIndex].num--;
        }
        Setitems(updatedItems);
      } else {
        const updatedItems = [...items];
        updatedItems[existingItemIndex].num++;
        Setitems(updatedItems);
      }
    }

  }

  function cansel(inputValue: any) {
    const existingItemIndex = items.findIndex((i: any) => i.id === item[inputValue].id);
    if (inputValue && item[inputValue]) {
      const updatedItems = [...items];
      updatedItems.splice(existingItemIndex, 1); // 'remove'を'splice'に変更
      Setitems(updatedItems);
    }
  }

  const Result = () => {
    let result = 0;
    for (let i = 0; i < items.length; i++) { // item.lengthをitems.lengthに修正
      let plus = items[i].money * items[i].num; // item[i]をitems[i]に修正
      result += plus;
    }
    return result; // 結果を返す
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.key !== 'Enter') return;
    handleSubmit(e);
  }

  return (
    <div className="font-sans">
      <Header />
      <h1 className=" text-[3rem] text-center">商品</h1>
      <div className="text-center">
        <input onKeyDown={handleKeyDown} className="text-black" id="itemid" type="text" />
      </div>
      <div className="w-full">
        {items.map((item: any, index: number) => (
          <div key={index} className="w-[80%] p-4 m-auto flex bg-[#373737] rounded-2xl border-2 border-[#474747] mb-1 h-[7rem]">
            <div className=" w-full align-buttom">
              <p className="text-[30px] text-center mt-[1rem]">{item.name}</p>
            </div>

            <div className="m-auto flex">
              <div className="block w-[8rem]">
                <p>単価:{item.money}円</p>
                <p>数:{item.num}個</p>
                <p>合計:{item.money * item.num}円</p>
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
