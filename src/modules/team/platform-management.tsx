'use client';

import * as React from 'react';
import { Plus, Trash2, Edit2, Check, X, Laptop, Smartphone, Server, Globe, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { getPlatformsAction, createPlatformAction, updatePlatformAction } from '@/backend/actions/platforms.actions';

export function PlatformManagement() {
    const [platforms, setPlatforms] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAdding, setIsAdding] = React.useState(false);
    const [newName, setNewName] = React.useState('');
    const [newCode, setNewCode] = React.useState('');
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [editName, setEditName] = React.useState('');
    const [editCode, setEditCode] = React.useState('');
    const { toast } = useToast();

    const fetchPlatforms = async () => {
        setIsLoading(true);
        const data = await getPlatformsAction();
        setPlatforms(data || []);
        setIsLoading(false);
    };

    React.useEffect(() => {
        fetchPlatforms();
    }, []);

    const handleCreate = async () => {
        if (!newName || !newCode) return;
        const result = await createPlatformAction(newName, newCode);
        if (result.success) {
            toast({ title: 'Platform added', description: `${newName} (${newCode.toUpperCase()}) is now active.` });
            setNewName('');
            setNewCode('');
            setIsAdding(false);
            fetchPlatforms();
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };

    const handleUpdate = async (id: string) => {
        if (!editName || !editCode) return;
        const result = await updatePlatformAction(id, editName, editCode);
        if (result.success) {
            toast({ title: 'Platform updated' });
            setEditingId(null);
            fetchPlatforms();
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive' });
        }
    };

    const getPlatformIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('android') || n.includes('ios') || n.includes('mobile')) return <Smartphone className="h-4 w-4" />;
        if (n.includes('web') || n.includes('frontend')) return <Globe className="h-4 w-4" />;
        if (n.includes('backend') || n.includes('api') || n.includes('server')) return <Server className="h-4 w-4" />;
        if (n.includes('qa') || n.includes('test')) return <Shield className="h-4 w-4" />;
        return <Laptop className="h-4 w-4" />;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Platform Management</h2>
                    <p className="text-slate-500 text-sm">Define platform codes for the Enterprise Story ID system.</p>
                </div>
                <Button 
                    onClick={() => setIsAdding(true)} 
                    disabled={isAdding}
                    className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl"
                >
                    <Plus className="h-4 w-4 mr-2" /> Add Platform
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isAdding && (
                    <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/30 animate-in fade-in zoom-in-95">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-indigo-600">New Platform</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Name</label>
                                <Input 
                                    placeholder="e.g. Android" 
                                    value={newName} 
                                    onChange={(e) => setNewName(e.target.value)}
                                    className="h-9 rounded-lg"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-slate-400">Code (Max 4 chars)</label>
                                <Input 
                                    placeholder="e.g. AD" 
                                    value={newCode} 
                                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                    maxLength={4}
                                    className="h-9 rounded-lg font-mono"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <Button onClick={handleCreate} size="sm" className="flex-1 bg-indigo-600 text-white h-8">Save</Button>
                                <Button onClick={() => setIsAdding(false)} size="sm" variant="ghost" className="h-8">Cancel</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {platforms.map(platform => (
                    <Card key={platform.id} className="group hover:border-indigo-200 transition-all shadow-sm">
                        <CardContent className="p-4">
                            {editingId === platform.id ? (
                                <div className="space-y-3">
                                    <Input 
                                        value={editName} 
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="h-8 text-sm"
                                    />
                                    <Input 
                                        value={editCode} 
                                        onChange={(e) => setEditCode(e.target.value.toUpperCase())}
                                        maxLength={4}
                                        className="h-8 text-sm font-mono"
                                    />
                                    <div className="flex items-center gap-2">
                                        <Button onClick={() => handleUpdate(platform.id)} size="sm" className="h-7 px-2"><Check className="h-3 w-3" /></Button>
                                        <Button onClick={() => setEditingId(null)} size="sm" variant="ghost" className="h-7 px-2"><X className="h-3 w-3" /></Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            {getPlatformIcon(platform.name)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 text-sm">{platform.name}</div>
                                            <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono border-slate-200 bg-slate-50">{platform.code}</Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            className="h-7 w-7 p-0"
                                            onClick={() => {
                                                setEditingId(platform.id);
                                                setEditName(platform.name);
                                                setEditCode(platform.code);
                                            }}
                                        >
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {platforms.length === 0 && !isLoading && !isAdding && (
                <div className="text-center py-12 bg-slate-50/50 rounded-[32px] border-2 border-dashed border-slate-200">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Server className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No platforms defined</h3>
                    <p className="text-slate-500 max-w-xs mx-auto mt-2">Add platforms to enable unique story IDs for your organization.</p>
                    <Button 
                        onClick={() => setIsAdding(true)}
                        variant="outline" 
                        className="mt-6 border-slate-200"
                    >
                        Initialize Platforms
                    </Button>
                </div>
            )}
        </div>
    );
}
