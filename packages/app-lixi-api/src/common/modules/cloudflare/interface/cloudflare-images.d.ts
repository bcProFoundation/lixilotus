declare module 'cloudflare-images' {
  export = Cloudflare;
  namespace Cloudflare {
    export interface UsageStats {
      count: {
        current: number;
        allowed: number;
      };
    }

    export type Metadata = Record<string, any>;

    export interface CloudflareError {
      code: number;
      message: string;
    }

    export type Operation =
      | 'image.list'
      | 'image.get'
      | 'image.create'
      | 'image.update'
      | 'image.delete'
      | 'image.download'
      | 'variant.list'
      | 'variant.get'
      | 'variant.create'
      | 'variant.update'
      | 'variant.delete'
      | 'usageStatistics.get';

    // =====================================================================
    // Logging
    // =====================================================================
    export namespace Logging {
      export type LogFunction = (message?: any, ...optionalParams: any[]) => void;

      export interface ILogger {
        trace: LogFunction;
        debug: LogFunction;
        info: LogFunction;
        warn: LogFunction;
        error: LogFunction;
        // fatal?: LogFunction
      }
    }

    // =====================================================================
    // Images
    // =====================================================================
    export namespace Images {
      export interface Image {
        /**
         * Image unique identifier.
         *
         * Used in URLs to access the image.
         *
         * Max length: `32`
         *
         * Read only.
         */
        id: string;
        /**
         * Image file name.
         *
         * Max length: `32`
         *
         * Read only.
         */
        filename: string;
        /**
         * When the media item was uploaded.
         */
        uploaded: string;
        /**
         * Indicates whether the image can be accessed using only its UID.
         *
         * If set to `true`, a signed token needs to be generated with a signing key to view the image.
         */
        requireSignedURLs: boolean;
        /**
         * Object specifying available variants for an image.
         *
         * Read only.
         */
        variants: string[];
        /**
         * User modifiable key-value store.
         *
         * Can use used for keeping references to another system of record for managing images.
         *
         * Read only.
         */
        meta?: Metadata;
      }

      export interface ListImagesResult {
        images: Image[];
      }
    }

    // =====================================================================
    // Variants
    // =====================================================================
    export namespace Variants {
      export namespace VariantFits {
        /**
         * Image will be shrunk in size to fully fit within the given width or height,
         * but will not be enlarged.
         */
        export type ScaleDown = 'scale-down';
        /**
         * Image will be resized (shrunk or enlarged) to be as large as possible within
         * the given width or height while preserving the aspect ratio.
         */
        export type Contain = 'contain';
        /**
         * Image will be resized to exactly fill the entire area specified by
         * width and height, and will be cropped if necessary.
         */
        export type Cover = 'cover';
        /**
         * Image will be shrunk and cropped to fit within the area specified by width and height.
         *
         * The image will not be enlarged.
         *
         * For images smaller than the given dimensions it is the same as `scale-down`.
         *
         * For images larger than the given dimensions, it is the same as `cover`.
         */
        export type Crop = 'crop';
        /**
         * Image will be resized (shrunk or enlarged) to be as large as possible within the
         * given width or height while preserving the aspect ratio, and the extra area will
         * be filled with a background color (white by default).
         */
        export type Pad = 'pad';
      }

      /** The fit property describes how the width and height dimensions should be interpreted. */
      export type VariantFit =
        | VariantFits.ScaleDown
        | VariantFits.Contain
        | VariantFits.Cover
        | VariantFits.Crop
        | VariantFits.Pad;

      export interface VariantOptions {
        /** The fit property describes how the width and height dimensions should be interpreted. */
        fit: VariantFit;
        /** What EXIF data should be preserved in the output image. */
        metadata?: 'keep' | 'copyright' | 'none';
        /** Maximum width in image pixels. */
        width: number;
        /** Maximum height in image pixels. */
        height: number;
        /** Indicates whether the variant can access an image without a signature, regardless of image access control. */
        neverRequireSignedURLs?: boolean;
      }
      export interface Variant {
        /** API item identifier tag. */
        id: string;
        /** Allows you to define image resizing sizes for different use cases. */
        options: VariantOptions;
      }

      export interface ListVariantsResult {
        variants: { [id: string]: Variant };
      }

      export interface GetVariantResult {
        variant: Variant;
      }

      export interface CreateVariantResult {
        id: string;
        variant: Variant;
      }

      export interface UpdateVariantResult {
        /** I guess the request that was sent. */
        o: VariantOptions;
        variant: Variant;
      }
    }

    // =====================================================================
    // Responses
    // =====================================================================
    export namespace Responses {
      export interface Response<T = unknown> {
        result: T;
        result_info: any;
        success: boolean;
        errors: CloudflareError[];
        messages: any[];
      }

      export type EmptyResponse<T = unknown> = Omit<Response<T>, 'result_info'>;

      export type ListImages = Response<Images.ListImagesResult>;
      export type GetImage = Response<Images.Image>;
      export type CreateImage = Response<Images.Image>;
      export type UpdateImage = Response<Images.Image>;
      export type DeleteImage = EmptyResponse;

      export type ListVariants = Response<Variants.ListVariantsResult>;
      export type GetVariant = Response<Variants.GetVariantResult>;
      export type CreateVariant = Response<Variants.CreateVariantResult>;
      export type UpdateVariant = Response<Variants.UpdateVariantResult>;
      export type DeleteVariant = EmptyResponse;

      export type UsageStatistics = Response<UsageStats>;
    }

    // =====================================================================
    // Requests
    // =====================================================================
    export namespace Requests {
      // -----------------------------------------------------------------
      // Images
      // -----------------------------------------------------------------
      export interface CreateImage {
        /**
         * Unique identifier.
         *
         * Used in URLs to access the image.
         *
         * Max length: `32`
         */
        id: string;
        fileName: string;
        /**
         * User modifiable key-value store.
         *
         * Can use used for keeping references to another system of record for managing images.
         * @default {}
         */
        metadata?: Metadata;
        /**
         * Indicates whether the image requires a signature token for the access.
         * @default false
         */
        requireSignedURLs?: boolean;
        // /**
        //  * A URL to fetch an image from origin.
        //  * Mutually exclusive with `file` parameter.
        //  */
        // url?: string
      }
      export interface ListImages {
        /**
         * Page number.
         * @default 1
         */
        page?: number;
        /**
         * Number of results per page.
         * Min of 10, max of 100.
         * @default 100
         */
        per_page?: number;
      }
      export interface UpdateImage {
        /**
         * User modifiable key-value store.
         * Can use used for keeping references to another system of record for managing images.
         * No change if not specified.
         */
        metadata?: Metadata;
        /**
         * Indicates whether the image can be accessed using only its UID.
         * If set to `true`, a signed token needs to be generated with a signing key to view the image.
         * Returns a new UID on a change.
         * No change if not specified.
         */
        requireSignedURLs?: boolean;
      }

      // -----------------------------------------------------------------
      // Variants
      // -----------------------------------------------------------------
      export type CreateVariant = Variants.Variant;
      export type UpdateVariant = Omit<Variants.Variant, 'options'>;
    }

    // =========================================================================
    // Client
    // =========================================================================
    export interface Credentials {
      /**
       * API key generated on the [My Account](https://dash.cloudflare.com/profile/api-tokens) page.
       */
      apiKey: string;
      accountId: string;
    }
  }
}
