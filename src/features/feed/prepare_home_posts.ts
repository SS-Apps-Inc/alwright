import { readHomePostsMemory, writeHomePostsMemory } from "@/memory";
import { mapPostRowToUI, type PostUI } from "@/network/post/postMappers";
import {
  apiGetCountryPostsPage,
  apiGetRandomCountryPostsPage,
} from "@/network/post/postsApi";
import type { PostsPageCursor } from "@/network/post/postTypes";
import { PAGINATION } from "@/config";
import { withPostDefaultsList } from "./home_posts_defaults";

export type PreparedHomePosts = {
  posts: PostUI[];
  cursor: PostsPageCursor;
  hasMore: boolean;
  pendingPosts: PostUI[] | null;
  pendingCursor: PostsPageCursor;
  pendingHasMore: boolean;
  randomPost: PostUI | null;
};

let preparedHomePosts: PreparedHomePosts | null = null;

export function getPreparedHomePosts() {
  return preparedHomePosts;
}

export async function prepareHomePostsForLaunch(
  countryCodesOverride?: string[]
) {
  const memory = readHomePostsMemory();
  const rememberedPosts = withPostDefaultsList(memory.posts);
  const countryCodes = countryCodesOverride ?? memory.settings.feedCountryCodes;
  const wantsRandomPost =
    memory.settings.showOnlyLastPost &&
    memory.settings.singlePostSource === "random";
  const randomPostPromise = wantsRandomPost
    ? apiGetRandomCountryPostsPage(countryCodes, 1, null).catch((error) => {
        console.error("Splash random-post preparation failed", error);
        return null;
      })
    : Promise.resolve(null);

  try {
    const [response, randomResponse] = await Promise.all([
      apiGetCountryPostsPage(countryCodes, PAGINATION.homePosts, null),
      randomPostPromise,
    ]);
    const fetched = withPostDefaultsList(response.rows.map(mapPostRowToUI));
    const randomPost = randomResponse?.rows[0]
      ? withPostDefaultsList([mapPostRowToUI(randomResponse.rows[0])])[0]
      : null;
    const hasMore = !!response.nextCursor && fetched.length > 0;
    const hasNewTopPost =
      !!fetched[0]?.id && fetched[0]?.id !== rememberedPosts[0]?.id;

    if (
      rememberedPosts.length > 0 &&
      hasNewTopPost &&
      !memory.settings.autoApplyLatestPosts
    ) {
      preparedHomePosts = {
        posts: rememberedPosts,
        cursor: memory.cursor,
        hasMore: memory.hasMore,
        pendingPosts: fetched,
        pendingCursor: response.nextCursor,
        pendingHasMore: hasMore,
        randomPost,
      };
      return preparedHomePosts;
    }

    preparedHomePosts = {
      posts: fetched,
      cursor: response.nextCursor,
      hasMore,
      pendingPosts: null,
      pendingCursor: null,
      pendingHasMore: true,
      randomPost,
    };
    writeHomePostsMemory({
      posts: fetched,
      cursor: response.nextCursor,
      hasMore,
      savedAt: Date.now(),
      settings: memory.settings,
    });
  } catch (error) {
    const randomResponse = await randomPostPromise;
    const fallbackRandomPost = randomResponse?.rows[0]
      ? withPostDefaultsList([mapPostRowToUI(randomResponse.rows[0])])[0]
      : rememberedPosts[0] ?? null;

    preparedHomePosts = {
      posts: rememberedPosts,
      cursor: memory.cursor,
      hasMore: memory.hasMore,
      pendingPosts: null,
      pendingCursor: null,
      pendingHasMore: true,
      randomPost: fallbackRandomPost,
    };
    console.error("Splash home-post preparation failed", error);
  }

  return preparedHomePosts;
}
