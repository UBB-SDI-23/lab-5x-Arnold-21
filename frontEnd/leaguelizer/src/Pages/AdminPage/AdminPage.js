import React from 'react';
import MainLayout from '../../Layouts/PageLayout/MainLayout/MainLayout';
import { Grid, Button } from '@mui/material';

function AdminPage() {
    const [userListVisible, setUserListVisible] = useState(false);
    const [bulkDeleteVisible, setBulkDeleteVisible] = useState(false);
    return (
        <MainLayout>
            <Grid container sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", pt: 5 }}>
                <Button variant="contained" sx={{ mt: 3 }}
                    onClick={() => (setUserListVisible((!bulkDeleteVisible) ? !userListVisible : userListVisible))}
                >See Users</Button>
                <Button variant="contained" sx={{ mt: 3, ml: 5 }}
                    onClick={() => (setBulkDeleteVisible((!userListVisible) ? !bulkDeleteVisible : bulkDeleteVisible))}
                >See Bulk Delete</Button>
            </Grid>
            {!userListVisible && bulkDeleteVisible &&
                <>
                    
                </>
            }
            {userListVisible && !bulkDeleteVisible &&
                <>
                    
                </>
            }
        </MainLayout>
    )
}

export default AdminPage