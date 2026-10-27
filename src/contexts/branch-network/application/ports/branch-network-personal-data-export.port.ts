import { PersonalDataExport } from '@ddd-ts-kit/kernel';

/**
 * The right of access and to portability, for what branch-network keeps of a person in clear: the columns its
 * tables declare with `personalFields`, handed over as plain data, one record per row. Run by the platform
 * (`npm run privacy:export`) with the exports of the other contexts, never by a use case.
 */
export abstract class BranchNetworkPersonalDataExport extends PersonalDataExport {}
