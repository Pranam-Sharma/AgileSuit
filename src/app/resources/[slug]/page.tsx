'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import curriculumData from '../../../docs/curriculum.json';

// Helper to generate a URL-friendly slug from a title
const toSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
};

const findTopicBySlug = (slug: string) => {
    for (const level of curriculumData.learningHubContent) {
        const foundTopic = level.topics.find(topic => toSlug(topic.title) === slug);
        if (foundTopic) return foundTopic;
    }
    return null;
}

// This page now acts as a redirector to the first sub-topic
export default function ResourceTopicPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    useEffect(() => {
        if (!slug) return;
        const topic = findTopicBySlug(slug);
        if (topic && topic.points.length > 0) {
            const firstSubTopicSlug = toSlug(topic.points[0]);
            router.replace(`/resources/${slug}/${firstSubTopicSlug}`);
        }
    }, [slug, router]);

    // Render nothing, or a loading spinner, while redirecting
    return null;
}
