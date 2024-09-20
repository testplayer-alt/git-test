import Link from "next/link"
export default function Head() {
    return (<>
        <div className=" w-[70%] bg-[#808080] m-auto text-[#333] h-[3rem] rounded-t-lg flex">
            <div className="w-[20%] m-auto">
                <Link href={"/user/account"} className="w-[70%] border-r-2 border-black">
                    <p className="text-center h-[100%]">
                        アカウント
                    </p>
                </Link>
            </div>
            <div className="w-[20%] m-auto">
                <Link href={"/user/account"} className="w-[70%] border-r-2 border-black">
                    <p className="text-center h-[100%]">
                        アカウント
                    </p>
                </Link>
            </div>
            <div className="w-[20%] m-auto">
                <Link href={"/user/account"} className="w-[70%] border-r-2 border-black">
                    <p className="text-center h-[100%]">
                        アカウント
                    </p>
                </Link>
            </div>
            <div className="w-[20%] m-auto">
                <Link href={"/user/account"} className="w-[70%] border-r-2 border-black">
                    <p className="text-center h-[100%]">
                        アカウント
                    </p>
                </Link>
            </div>
        </div>
    </>)
}