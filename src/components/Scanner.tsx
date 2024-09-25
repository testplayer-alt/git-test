import { BrowserMultiFormatReader } from '@zxing/browser'
import { Result } from '@zxing/library'
import { useMemo, useRef } from 'react'
import { useDebounce } from 'react-use'
import { useEffect, useState } from 'react';

type ScannerProps = {
    onReadCode?: (text: Result) => void
}

export const Scanner = ({ onReadCode }: ScannerProps) => {
    const [isClient, setIsClient] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const codeReader = useMemo(() => new BrowserMultiFormatReader(), []);

    useEffect(() => {
        setIsClient(true); // クライアント側でのみ実行
    }, []);
    useDebounce(async () => {
        if (!videoRef.current) return
        await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
            if (!result) return
            if (error) {
                console.log('ERROR!! : ', error)
                return
            }
            onReadCode?.(result)
        })
    }, 2000)

    return (
        <div>
            {isClient && (
                <video style={{ width: '100%' }} ref={videoRef} />
            )}
        </div>
    )
}
