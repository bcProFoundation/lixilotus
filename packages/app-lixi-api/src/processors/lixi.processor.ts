import { Process, Processor } from "@nestjs/bull";
import { Injectable } from "@nestjs/common";
import { Job } from "bull";
import { LIXI_QUEUE } from "src/constants/lixi.constants";
import { LixiService } from "src/services/lixi/lixi.service";

@Injectable()
@Processor(LIXI_QUEUE)
export class LixiProcessor {

  constructor(
    private readonly _mailerService: LixiService,
  ) { }

  @Process('create-sub-lixies')
  public async createLixies(job: Job<{ emailAddress: string; confirmUrl: string }>) {
    try {

    } catch {
    }
  }
}