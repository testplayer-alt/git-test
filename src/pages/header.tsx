import { useRouter } from "next/router";
import { useState, useEffect } from "react";
export default function Header() {
    const router = useRouter();
    const [url, setUrl] = useState<string>(''); // URLを管理する状態を追加
    useEffect(() => {
        setUrl(router.asPath.replace('/?dep=', '')); // URLを設定
    }, [router.asPath]);
    return <>
        <div className=" font-thin">
            <header>
                <div className="navtext-container bg-[#676767]">
                    <div className="navtext">{url}</div>
                </div>
            </header>
        </div>
    </>
}