import { useState } from 'react';
import { Scanner } from './Scanner';
import { Alert, Box, Container, Stack, TextField, useMediaQuery, useTheme } from '@mui/material';
import { useToast } from '../hooks/useToast';

export const App = () => {
    const [codes, setCodes] = useState<string[]>([]); // 確実に配列として初期化
    const theme = useTheme();
    const matches = useMediaQuery(theme.breakpoints.up('md'));
    const [Toast, { handleOnClose, handleOnOpen, isOpen }] = useToast();

    const handleReadCode = (result: any) => {
        const newCode = result.getText(); // 新しいコードを取得
        console.log(newCode);
        setCodes([newCode]); // codesを新しいコードの配列に設定
        handleOnOpen(); // トーストを表示
    };

    return (
        <Container>
            {matches ? (
                <Box display={'flex'} gap={2}>
                    <Box flex={1}>
                        <Scanner onReadCode={handleReadCode} />
                    </Box>
                    <Stack width={300} spacing={2}>
                        <TextField fullWidth multiline rows={10} value={codes.join('\n')} className='bg-[#fff]' id='itemid' />
                    </Stack>
                </Box>
            ) : (
                <Stack spacing={2}>
                    <Scanner onReadCode={handleReadCode} />
                    <TextField fullWidth multiline rows={5} value={codes.join('\n')} className='bg-[#fff]' id='itemid' />
                </Stack>
            )}
            <Toast isOpen={isOpen} onClose={handleOnClose}>
                <Alert onClose={handleOnClose} severity={'success'} sx={{ width: '100%' }}>
                    バーコードの読み取りに成功しました！
                </Alert>
            </Toast>
        </Container>
    );
};
