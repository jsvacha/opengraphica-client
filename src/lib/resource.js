import store from '@/store';
import { Cache } from 'three';
Cache.enabled = true;

export function loadResourcesToThreeCache() {
    let loadPromises = [];
    for (let i = 0; i < store.state.resources.length; i++) {
        let resourceDef = store.state.resources[i];
        if (resourceDef.type === 'raster-image') {
            loadPromises.push(new Promise((resolve, reject) => {
                const image = new Image();
                image.src = resourceDef.data;
                image.onload = async () => {
                    Cache.add('/resources/' + resourceDef.id, image);
                    resolve();
                };
                image.onerror = reject;
            }));
        }
    }
    return Promise.all(loadPromises);
}

export function loadFileAsResource(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener("load", async () => {
            const image = new Image();
            image.src = reader.result;
            image.onload = async () => {
                const resourceId = await store.dispatch('addResource', {
                    type: 'raster-image',
                    data: reader.result,
                    meta: {
                        width: image.width,
                        height: image.height
                    }
                });
                Cache.add('/resources/' + resourceId, image);
                resolve(store.getters.resourceById(resourceId));
            };
            image.onerror = reject;
        }, false);
        reader.addEventListener('error', (e) => {
            reject(e);
        });
        reader.readAsDataURL(file);
    });
}